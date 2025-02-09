.PHONY: start start-back start-front start-db run stop stop-back stop-front stop-db restart-back lint clean test test-be test-be-unit test-be-e2e test-be-deps wait-for-db migrate-db db-reset db-clean wait-for-test-db

# Clean the NX cache and stop the daemon
clean:
	@echo "Cleaning NX cache and stopping daemon..."
	@pkill -f "nx" || true
	@rm -rf .nx
	@rm -rf node_modules/.cache/nx
	@npx nx reset

# Start the PostgreSQL DB using docker-compose
start-db:
	@echo "Starting PostgreSQL DB..."
	@docker-compose up -d
	@make wait-for-db
	@make migrate-db

# Wait for PostgreSQL to be ready
wait-for-db:
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec gnosis-postgres-1 pg_isready -h localhost -U postgres > /dev/null 2>&1; do \
		echo "Waiting for PostgreSQL to start..."; \
		sleep 2; \
	done
	@echo "PostgreSQL is accepting connections!"
	@echo "Waiting for PostgreSQL to be fully ready..."
	@sleep 5
	@echo "PostgreSQL is ready!"

# Run database migrations with retries
migrate-db:
	@echo "Running database migrations..."
	@for i in 1 2 3; do \
		if npx prisma migrate deploy; then \
			exit 0; \
		fi; \
		echo "Migration attempt $$i failed. Retrying..."; \
		sleep 5; \
	done; \
	exit 1

# Stop the PostgreSQL DB
stop-db:
	@echo "Stopping PostgreSQL DB..."
	@docker-compose down

# Start the backend with ts-node for better development experience
start-back:
	@echo "Starting backend..."
	@cp .env backend/.env
	@cd backend && npx prisma generate --schema=../prisma/schema.prisma
	@cd backend && ts-node src/main.ts &
	@echo "Backend started on port 8000"

# Stop the backend gracefully
stop-back:
	@echo "Stopping backend..."
	@pkill -f "ts-node src/main.ts" || true
	@echo "Backend stopped"

# Restart the backend
restart-back: stop-back start-back
	@echo "Backend restarted"

start-front:
	@echo "Starting frontend..."
	@nx run frontend:dev

stop-front:
	@echo "Stopping frontend..."
	@pkill -f "nx run frontend:dev" || true

# Composite command: starts the DB, backend, and frontend
start: start-db start-back start-front
	@echo "All services started: DB, backend, and frontend."

# Stop all services
stop: stop-front stop-back stop-db
	@echo "All services stopped."

run: start-back start-front
	@echo "Both backend and frontend have been started."

lint:
	@echo "Linting backend and frontend..."
	@npx nx run-many --target=lint --projects=backend,frontend

# Test commands
test-be-deps:
	@echo "Installing backend test dependencies..."
	@cd backend && npm install
	@echo "Copying .env file to backend directory..."
	@cp .env backend/.env
	@echo "Generating Prisma client..."
	@cd backend && npx prisma generate --schema=../prisma/schema.prisma

# Wait for test PostgreSQL to be ready
wait-for-test-db:
	@echo "Waiting for test PostgreSQL to be ready..."
	@until docker exec gnosis-postgres-test-1 pg_isready -h localhost -U postgres > /dev/null 2>&1; do \
		echo "Waiting for test PostgreSQL to start..."; \
		sleep 2; \
	done
	@echo "Test PostgreSQL is accepting connections!"
	@echo "Waiting for test PostgreSQL to be fully ready..."
	@sleep 5
	@echo "Test PostgreSQL is ready!"

test-db-setup:
	@echo "Setting up test database..."
	@docker-compose -f docker-compose.test.yml up -d
	@make wait-for-test-db
	@DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gnosis_test_db" npx prisma migrate deploy

test-db-teardown:
	@echo "Tearing down test database..."
	@docker-compose -f docker-compose.test.yml down -v

test-be-unit: test-be-deps
	@echo "Running backend unit tests..."
	@cd backend && NODE_ENV=test npx jest --config=jest.config.ts --testRegex="\\.spec\\.ts$$" --testPathPattern=src/

test-be-e2e: test-be-deps test-db-setup
	@echo "Running backend e2e tests..."
	@cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gnosis_test_db" NODE_ENV=test npx jest --config=test/jest-e2e.json --testRegex="\\.e2e-spec\\.ts$$" --testPathPattern=test/
	@make test-db-teardown

test-be: test-be-unit test-be-e2e
	@echo "Backend tests completed."

# Default test command that runs all tests
test: test-be
	@echo "All tests completed."

# Database management commands
db-reset: stop-db
	@echo "Resetting database..."
	@docker volume rm gnosis_postgres_data || true
	@make start-db
	@echo "Database reset completed."

db-clean:
	@echo "Cleaning database (keeping structure)..."
	@docker exec gnosis-postgres-1 psql -U postgres -d gnosis_db -c "DO \$$\$$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END \$$\$$;"
	@echo "Database cleaned."
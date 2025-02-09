.PHONY: start start-back start-front start-db run stop stop-back stop-front stop-db restart-back lint clean test test-be test-be-unit test-be-e2e test-be-deps

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

# Stop the PostgreSQL DB
stop-db:
	@echo "Stopping PostgreSQL DB..."
	@docker-compose down

# Start the backend with ts-node for better development experience
start-back:
	@echo "Starting backend..."
	@cp .env backend/.env
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

test-db-setup:
	@echo "Setting up test database..."
	@docker-compose -f docker-compose.test.yml up -d
	@sleep 2
	@DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gnosis_test_db" npx prisma migrate deploy

test-be-unit: test-be-deps
	@echo "Running backend unit tests..."
	@cd backend && NODE_ENV=test npx jest --config=jest.config.ts --testRegex="\\.spec\\.ts$$" --testPathPattern=src/

test-be-e2e: test-be-deps test-db-setup
	@echo "Running backend e2e tests..."
	@cd backend && DATABASE_URL="postgresql://postgres:postgres@localhost:5433/gnosis_test_db" NODE_ENV=test npx jest --config=test/jest-e2e.json --testRegex="\\.e2e-spec\\.ts$$" --testPathPattern=test/
	@docker-compose -f docker-compose.test.yml down
	@rm -f backend/.env

test-be: test-be-unit test-be-e2e
	@echo "Backend tests completed."

# Default test command that runs all tests
test: test-be
	@echo "All tests completed."
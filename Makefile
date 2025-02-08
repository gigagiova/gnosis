.PHONY: start start-back start-front start-db run stop lint

# Start the PostgreSQL DB using docker-compose
start-db:
	@echo "Starting PostgreSQL DB..."
	@docker-compose up -d

start-back:
	@echo "Starting backend..."
	@npx nx run backend:serve:development &

start-front:
	@echo "Starting frontend..."
	@npx nx run frontend:dev

# Composite command: starts the DB, backend, and frontend
start: start-db start-back start-front
	@echo "All services started: DB, backend, and frontend."

run: start-back start-front
	@echo "Both backend and frontend have been started."

stop:
	@echo "Stopping backend..."
	@pkill -f "nx run backend:dev" || true
	@echo "Stopping frontend..."
	@pkill -f "nx run frontend:dev" || true

lint:
	@echo "Linting backend and frontend..."
	@npx nx run-many --target=lint --projects=backend,frontend
.PHONY: start start-back start-front start-db run stop lint clean

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

start-back:
	@echo "Starting backend..."
	@NX_DAEMON=false nx run backend:serve:development &

start-front:
	@echo "Starting frontend..."
	@nx run frontend:dev

# Composite command: starts the DB, backend, and frontend
start: start-db start-back start-front
	@echo "All services started: DB, backend, and frontend."

run: start-back start-front
	@echo "Both backend and frontend have been started."

stop:
	@echo "Stopping backend..."
	@pkill -f "nx run backend:serve:development" || true
	@echo "Stopping frontend..."
	@pkill -f "nx run frontend:dev" || true

lint:
	@echo "Linting backend and frontend..."
	@npx nx run-many --target=lint --projects=backend,frontend
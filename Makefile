.PHONY: run start-back start-front stop

start-back:
	@echo "Starting backend..."
	@npx nx run backend:serve:development &

start-front:
	@echo "Starting frontend..."
	@npx nx run frontend:dev

run: start-back start-front
	@echo "Both backend and frontend have been started."

stop:
	@echo "Stopping backend..."
	@pkill -f "nx run backend:dev" || true
	@echo "Stopping frontend..."
	@pkill -f "nx run frontend:dev" || true
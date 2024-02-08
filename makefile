BACKEND_ENV = backend/.env
FRONTEND_ENV = frontend/.env

# ====================================
# Development commands
# ====================================
deploy-dev: setup-dev
	@docker compose -f docker-compose.dev.yaml up -d
	@echo "Adminer available at: http://localhost:8888"
	@echo "Postgres available at: postgres://ws_user:ws_password@localhost:5432/projet_ws"

down-dev:
	@docker compose -f docker-compose.dev.yaml down

setup-dev: $(backend_ENV) $(FRONTEND_ENV)
	@cd backend && pnpm install
	@cd frontend && pnpm install

# ====================================
# Production commands
# ====================================
deploy: $(BACKEND_ENV) $(FRONTEND_ENV)
	@docker compose up -d --build

down:
	@docker compose down

# ====================================
# Common commands
# ====================================
$(BACKEND_ENV):
	@cd backend && cp .env.example .env
	@sed -i 's/APP_SECRET=/APP_SECRET=$(shell head -c 16 /dev/urandom | shasum -a 256 | cut -d" " -f1 | head -c 32)/g' backend/.env

$(FRONTEND_ENV):
	@cd frontend && cp .env.example .env

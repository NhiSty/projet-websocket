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
	@rm $(BACKEND_ENV) $(FRONTEND_ENV)

setup-dev: $(BACKEND_ENV) $(FRONTEND_ENV)
	@cd backend && pnpm install && pnpm prisma generate
	@cd frontend && pnpm install

# ====================================
# Production commands
# ====================================
deploy: $(BACKEND_ENV) $(FRONTEND_ENV)
	@docker compose up -d --build

down:
	@docker compose down
	@rm $(BACKEND_ENV) $(FRONTEND_ENV)

# ====================================
# Common commands
# ====================================
$(BACKEND_ENV):
	@node backend/scripts/make-env.js

$(FRONTEND_ENV):
	@cd frontend && cp .env.example .env

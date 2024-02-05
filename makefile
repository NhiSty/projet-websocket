deploy-dev:
	@docker compose -f docker-compose.dev.yaml up -d
	@echo "Adminer available at: http://localhost:8888"
	@echo "Postgres available at: postgres://ws_user:ws_password@localhost:5432/projet_ws"

down-dev:
	@docker compose -f docker-compose.dev.yaml down

deploy:
	@docker compose up -d

down:
	@docker compose down
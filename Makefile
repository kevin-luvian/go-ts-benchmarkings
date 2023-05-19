
setup:
	@echo "${NOW} === SETTING UP ENVIRONMENTS ==="
	@go work use ./backend-go ./backend-go-sse
	@cp ./.env ./frontend/.env
	@cp ./.env ./backend-go/.env
	@cp ./.env ./backend-go-sse/.env
	@cp ./.env ./backend-node/.env
	@echo "=== DONE ==="

compose:
	@echo "${NOW} === COMPOSING DOCKER CONTAINERS ==="
	@cp ./docker.env ./frontend/.env
	@cp ./docker.env ./backend-go/.env
	@cp ./docker.env ./backend-go-sse/.env
	@cp ./docker.env ./backend-node/.env
	@docker-compose up -d
	@echo "=== DONE ==="

compose-down:
	@echo "${NOW} === COMPOSING DOWN DOCKER CONTAINERS ==="
	@docker-compose down
	@make setup
	@echo "=== DONE ==="

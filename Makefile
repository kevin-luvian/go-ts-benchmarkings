
setup:
	@echo "${NOW} === SETTING UP ENVIRONMENTS ==="
	@go work use ./backend-go ./backend-go-sse
	@cp ./.env ./backend-go/.env
	@cp ./.env ./backend-go-sse/.env
	@cp ./.env ./backend-node/.env
	@echo "=== DONE ==="

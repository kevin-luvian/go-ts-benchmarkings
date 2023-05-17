
setup:
	@echo "${NOW} === SETTING UP ENVIRONMENTS ==="
	@cp ./.env ./backend-go/.env
	@cp ./.env ./backend-node/.env
	@echo "=== DONE ==="

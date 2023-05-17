export NOW=$(shell date +"%Y/%m/%d %H:%M:%S")
export PKGS=$(shell go list ./... | grep -vE '(vendor|cmd|entity|pkg/assert)')

play:
	@echo "${NOW} 🚀 === RUNNING PLAYGROUND === 🚀"
	@go run ./dev/playground
	@echo "=== DONE ==="

run:
	@echo "${NOW} 🚀 === RUNNING SERVER === 🚀"
	@go run ./server
	@echo "=== DONE ==="

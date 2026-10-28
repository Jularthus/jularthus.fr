.DEFAULT_GOAL := help
.PHONY: help dev up down logs deploy backup check setup

# Address the test suite runs against (make check URL=http://127.0.0.1:8380/)
URL ?= http://127.0.0.1:8787/

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-8s\033[0m %s\n", $$1, $$2}'

dev: ## Serve public/ on http://127.0.0.1:8787 (edits show on refresh, 404s like production)
	python3 tools/serve.py

up: ## Build and start in the background
	mkdir -p data
	docker compose up -d --build

down: ## Stop the container
	docker compose down

logs: ## Follow the logs
	docker compose logs -f --tail=100

deploy: ## Pull the latest code and restart
	git pull
	$(MAKE) up

backup: ## Add a dated git bundle of the whole repo to data/backups (never deletes)
	@mkdir -p data/backups
	@f=data/backups/jularthus.fr-$$(date +%F-%H%M%S).bundle; \
	git bundle create "$$f" --all 2>/dev/null && git bundle verify -q "$$f" 2>/dev/null && echo "$$f"

check: ## Run the browser test suite (make dev first, or URL=http://127.0.0.1:8380/)
	cd tools && node check.js $(URL)

setup: ## First time: install the test tools and enable the git hooks
	cd tools && npm ci && npx playwright install chromium
	git config core.hooksPath tools/hooks

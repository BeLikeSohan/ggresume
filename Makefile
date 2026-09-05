# GGResume Production Makefile
COMPOSE_FILE = docker-compose.prod.yml

.PHONY: help up down restart build logs pull deploy redeploy status clean

help:
	@echo "Available commands:"
	@echo "  make deploy     - Stop containers, pull latest code from git, and rebuild/start"
	@echo "  make redeploy   - Alias for 'make deploy'"
	@echo "  make up         - Build and start production containers in background"
	@echo "  make down       - Stop and remove production containers"
	@echo "  make restart    - Restart production containers"
	@echo "  make build      - Rebuild production images"
	@echo "  make logs       - Tail logs of running production containers"
	@echo "  make pull       - Pull latest changes from git"
	@echo "  make status     - View status of running containers"
	@echo "  make clean      - Prune dangling docker images and build cache"

# Start production containers
up:
	docker compose -f $(COMPOSE_FILE) up -d --build

# Stop production containers
down:
	docker compose -f $(COMPOSE_FILE) down

# Pull latest code from git
pull:
	git pull

# Build production images without starting
build:
	docker compose -f $(COMPOSE_FILE) build

# Restart containers
restart: down up

# Tail live production logs
logs:
	docker compose -f $(COMPOSE_FILE) logs -f

# Check container status
status:
	docker compose -f $(COMPOSE_FILE) ps

# Full redeploy workflow: down -> pull -> up --build
deploy: down pull up

redeploy: deploy

# Clean up dangling images and builder cache
clean:
	docker image prune -f
	docker builder prune -f

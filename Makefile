## ROOT
dc-logs:
	@docker-compose logs -f
.PHONY: dc-logs

start-app: start-db start-backend
.PHONY: start-app

stop-app: 
	@docker-compose down
.PHONY: stop-app

start-backend:
	@docker-compose up -d yt-fake-backend
.PHONY: start-backend

start-db:
	@docker-compose up -d postgres
.PHONY: start-db

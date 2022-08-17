## BACKEND
open-backend:
	@docker-compose exec yt-fake-backend ash
.PHONY: open-backend

lint: 
	@docker-compose exec yt-fake-backend npm run lint
.PHONY: lint

test: 
	@docker-compose exec yt-fake-backend npm run test:ci
.PHONY: test

test-mutation: 
	@docker-compose exec yt-fake-backend npm run test:mutation
.PHONY: test-mutation

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
	@docker volume create --name=database
	@docker-compose up -d postgres
.PHONY: start-db

config-alias:
	alias glogp="git log --pretty=format:\"%C(auto) %h %Cgreen %ad %C(auto) %s\" --date=format:\"%d/%m/%y %T\""
.PHONY: config-alias
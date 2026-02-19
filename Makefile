dev:
	npm run start:dev

build:
	npm run build

# Docker: build image only
docker-build:
	docker build -t template-nestjs .

# Docker Compose: build and start app + DB
docker-up:
	docker-compose up -d

# Docker Compose: build images then start
docker-up-build:
	docker-compose up -d --build

# Docker Compose: stop and remove containers
docker-down:
	docker-compose down

# Docker Compose: view logs
docker-logs:
	docker-compose logs -f
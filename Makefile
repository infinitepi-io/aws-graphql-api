up:
	docker-compose up --build -d

down:
	docker-compose down

logs:
	docker-compose logs -f

test:
	docker-compose run dev npm test

dev:
	docker-compose up --build

test-api:
	curl -v http://localhost:3000/graphiql

.PHONY: up down logs test dev test-api
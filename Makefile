BACKEND_DIR=backend
FRONTEND_DIR=frontend
BACKEND_IMAGE=xslt-playground-backend
FRONTEND_IMAGE=xslt-playground-frontend


.PHONY: all backend-build frontend-build backend-image frontend-image compose-up compose-down clean backend-test frontend-test test

all: backend-test frontend-test backend-build frontend-build backend-image frontend-image compose-up

backend-build:
	cd $(BACKEND_DIR)/src && go mod tidy && go build -o ../server

backend-test:
	cd $(BACKEND_DIR)/src && GOCACHE=$$(pwd)/.gocache go test ./...

frontend-build:
	cd $(FRONTEND_DIR) && npm install && npm run build

frontend-test:
	cd $(FRONTEND_DIR) && npm install && npm run test

test: backend-test frontend-test

backend-image:
	docker build --platform linux/amd64 -t $(BACKEND_IMAGE) $(BACKEND_DIR)
		docker tag $(BACKEND_IMAGE):latest  ghcr.io/alexandrev/$(BACKEND_IMAGE):latest

frontend-image:
	docker build --platform linux/amd64 -t $(FRONTEND_IMAGE) $(FRONTEND_DIR)
	docker tag $(FRONTEND_IMAGE):latest  ghcr.io/alexandrev/$(FRONTEND_IMAGE):latest

compose-up:
	docker compose -f docker-compose.local.yml up

compose-down:
	docker compose -f docker-compose.local.yml down

clean:
	-docker compose -f docker-compose.local.yml down --remove-orphans --rmi local
	@if docker image inspect $(BACKEND_IMAGE):latest >/dev/null 2>&1; then docker image rm -f $(BACKEND_IMAGE):latest; fi
	@if docker image inspect $(FRONTEND_IMAGE):latest >/dev/null 2>&1; then docker image rm -f $(FRONTEND_IMAGE):latest; fi
	@if docker image inspect ghcr.io/alexandrev/$(BACKEND_IMAGE):latest >/dev/null 2>&1; then docker image rm -f ghcr.io/alexandrev/$(BACKEND_IMAGE):latest; fi
	@if docker image inspect ghcr.io/alexandrev/$(FRONTEND_IMAGE):latest >/dev/null 2>&1; then docker image rm -f ghcr.io/alexandrev/$(FRONTEND_IMAGE):latest; fi

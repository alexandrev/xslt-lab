BACKEND_DIR=backend
FRONTEND_DIR=frontend
BACKEND_IMAGE=xslt-playground-backend
FRONTEND_IMAGE=xslt-playground-frontend


.PHONY: all backend-build frontend-build backend-image frontend-image compose-up compose-down

all: backend-build frontend-build backend-image frontend-image compose-up

backend-build:
	cd $(BACKEND_DIR)/src && go mod tidy && go build -o ../server

frontend-build:
	cd $(FRONTEND_DIR) && npm install && npm run build

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

BACKEND_DIR=backend
FRONTEND_DIR=frontend
BACKEND_IMAGE=xslt-playground-backend
FRONTEND_IMAGE=xslt-playground-frontend

.PHONY: backend-build frontend-build backend-image frontend-image compose-up compose-down

backend-build:
	cd $(BACKEND_DIR)/src && go mod tidy && go build -o ../server

frontend-build:
	cd $(FRONTEND_DIR) && npm install && npm run build

backend-image:
	docker build -t $(BACKEND_IMAGE) $(BACKEND_DIR)

frontend-image:
	docker build -t $(FRONTEND_IMAGE) $(FRONTEND_DIR)

compose-up:
	docker compose up

compose-down:
	docker compose down

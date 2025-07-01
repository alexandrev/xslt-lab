# xslt-lab

Your Lab for XSLT Transformation.

## Frontend

The React/Vite frontend lives in `frontend/`. Use `npm install` inside that folder and run:

```bash
npm run dev
```

This starts the playground at `http://localhost:3000`.

The app will call the Go backend at `/transform` to perform XSLT transformations.
Set the backend URL by creating a `.env` file inside `frontend/`:

```bash
VITE_BACKEND_URL=http://localhost:8000
```

If omitted the app assumes the backend runs on the same host and port.

### Docker

To build a container with the compiled frontend run:

```bash
docker build -t xslt-playground-frontend \
  --build-arg VITE_BACKEND_URL=http://localhost:8000 frontend
```

The resulting image serves the static files with nginx on port 80.

## Backend

The Go backend resides under `backend/`. Compile it using the Makefile which
downloads Go modules automatically:

```bash
make backend-build
./backend/server
```

You can also produce a container image using the provided Dockerfile:

```bash
docker build -t xslt-playground-backend backend
```

By default it listens on port `8000` as configured in `backend/app.config`.

### Environment

The backend requires a PostgreSQL database and Firebase credentials for
authentication. Provide these via environment variables:

```bash
export DATABASE_URL="postgres://user:pass@localhost/dbname"
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
```

The Firebase project ID is read from the credentials file.

### Makefile

Common tasks are defined in the provided `Makefile`.
Running `make` without arguments will build both binaries,
create the container images and start Docker Compose
without shutting it down automatically:

```bash
# Build Go binary
make backend-build
# Build React production files
make frontend-build
# Create container images
make backend-image
make frontend-image
```

### Docker Compose

To run the entire stack locally with PostgreSQL use:

```bash
make backend-image frontend-image
docker compose up
```

The compose file builds the frontend with `VITE_BACKEND_URL=http://backend:8000`
so it talks to the backend container.

This starts the backend on port `8000`, the frontend on `3000` and a PostgreSQL instance on `5432`.

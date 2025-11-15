# xslt-lab

Your Lab for XSLT Transformation.

## News & Releases

- Follow updates on the GitHub Pages blog: [alexandrev.github.io/xslt-lab](https://alexandrev.github.io/xslt-lab/).
- Review detailed changes in [CHANGELOG.md](https://github.com/alexandrev/xslt-lab/blob/main/CHANGELOG.md).

## Frontend

The React/Vite frontend lives in `frontend/`. Use `npm install` inside that folder and run:

```bash
npm run dev
```

This starts the playground at `http://localhost:3000`.

The app will call the Go backend at `/transform` to perform XSLT transformations.
Set the backend URL by creating a `.env` file inside `frontend/` or by exporting
`VITE_BACKEND_URL` when starting the dev server:

```bash
VITE_BACKEND_URL=http://localhost:8000 npm run dev
```

If omitted the app assumes the backend runs on the same host and port. In the
containerized version the URL is now read at **runtime** from environment
variables so you can configure it directly in the pod.

When `VITE_GO_PRO=true` the UI exposes additional features like Google
authentication. For authentication you must
provide Firebase configuration via `VITE_FIREBASE_CONFIG` containing the JSON
object used by `initializeApp`.
Set `VITE_GA_ID` to enable Google Analytics tracking.

The playground keeps up to three independent workspaces (tabs). Each workspace
persists its own inputs, trace output, errors and results, and you can export or
import them as JSON files to share setups easily.

### Docker

To build a container with the compiled frontend run:

```bash
docker build -t xslt-playground-frontend frontend
```

The resulting image serves the static files with nginx on port 80. When the
container starts it logs the value of `VITE_BACKEND_URL` so you can confirm the
backend in use in the pod logs. The URL is now picked up **at runtime** from the
container environment.

```
Using this URL as backendURL: http://localhost:8000
```

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
The same file sets `saxon_classpath` so the Java process can load Saxon and
its dependencies from `/opt/saxon/*`.

The backend image also builds a small jar with custom Saxon extension
functions. It gets copied to `/opt/saxon/custom-functions.jar` during the
Docker build. You can call these from XSLT using the namespace
`xmlns:tib="http://www.tibco.com/bw/xslt/custom-functions"`. The jar exposes
many helper functions such as `tib:uuid()`, `tib:timestamp()` and
`tib:addToDate()`.

### Environment

When `VITE_GO_PRO=true` the backend stores transformation history and
requires a PostgreSQL database as well as Firebase credentials for
authentication. Provide these via environment variables:

```bash
export DATABASE_URL="postgres://user:pass@localhost/dbname"
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccount.json
export SAXON_CLASSPATH=/opt/saxon/*
```

The Firebase project ID is read from the credentials file.

If `VITE_GO_PRO` is not set or is `false` the backend skips database and
Firebase initialization and only exposes the `/transform` endpoint.

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

For a lightweight setup without PostgreSQL run:

```bash
docker compose -f docker-compose.local.yml up
```

This starts just the frontend and backend with `VITE_GO_PRO=false`.

The compose file passes `VITE_BACKEND_URL=http://backend:8000` to the frontend
container so it talks to the backend container.

This starts the backend on port `8000`, the frontend on `3000` and a PostgreSQL instance on `5432`.

## Helm Chart

A Helm chart is provided under `charts/xslt-playground` to deploy the frontend and backend on Kubernetes. By default it expects Firebase credentials and a PostgreSQL database. Before installing, create a secret with your Firebase credentials:

```bash
kubectl create secret generic firebase-config \
  --from-file=service-account.json=</path/to/serviceAccount.json> \
  --from-file=firebase-config.json=</path/to/firebaseConfig.json>
```

Install the chart with:

```bash
helm install xslt charts/xslt-playground
# Disable Firebase or database support if desired
# helm install xslt charts/xslt-playground --set firebase.enabled=false
# helm install xslt charts/xslt-playground --set storage.enabled=false
```

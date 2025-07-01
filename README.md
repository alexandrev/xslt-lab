# xslt-lab

Your Lab for XSLT Transformation.

## Frontend

The React/Vite frontend lives in `frontend/`. Use `npm install` inside that folder and run:

```bash
npm run dev
```

This starts the playground at `http://localhost:3000`.

The app will call the Go backend at `/transform` to perform XSLT transformations.

### Docker

To build a container with the compiled frontend run:

```bash
docker build -t xslt-playground-frontend frontend
```

The resulting image serves the static files with nginx on port 80.

## Backend

The Go backend resides under `backend/`. To build and run it locally you need Go
installed:

```bash
cd backend/src
go run .
```

You can also produce a container image using the provided Dockerfile:

```bash
docker build -t xslt-playground-backend backend
```

By default it listens on port `8000` as configured in `backend/app.config`.

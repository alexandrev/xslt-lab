# xslt-playground Helm Chart

This chart deploys the frontend and backend of xslt-playground.

## Configuration

Key parameters in `values.yaml`:

- `image.frontend` and `image.backend` – container images.
- `firebase.enabled` – set to `false` to disable Firebase integration entirely.
  When enabled you must provide a secret named by `firebase.secretName` with the
  keys `firebase.credentialsKey` and `firebase.configKey`. The backend mounts the
  credentials file at `firebase.credentialsMountPath` and the frontend reads the
  config JSON.
- `storage.enabled` – disable database usage when `false`. If enabled the backend
  gets `DATABASE_URL` from `storage.databaseUrl`; otherwise the environment
  variable `DISABLE_DATABASE=true` is set.
- `ingress` – configure ingress for the frontend service. The backend is exposed
  through a second ingress using the hostname `backend.<hostname>` with the same
  settings.
  - `frontend.backendUrl` – value for `VITE_BACKEND_URL` used by the frontend.
    The frontend reads this variable at runtime so changing the deployment does
    not require rebuilding the image. When empty it defaults to the internal
    backend service URL.
- `hpa` – enable CPU-based autoscaling for both deployments.

When `firebase.enabled` is true you must create the secret before installing the chart:

```bash
kubectl create secret generic firebase-config \
  --from-file=service-account.json=</path/to/serviceAccount.json> \
  --from-file=firebase-config.json=</path/to/firebaseConfig.json>
```

Install the chart with:

```bash
helm install xslt charts/xslt-playground
```


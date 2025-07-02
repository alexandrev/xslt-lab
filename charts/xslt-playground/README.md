# xslt-playground Helm Chart

This chart deploys the frontend and backend of xslt-playground.

## Configuration

Key parameters in `values.yaml`:

- `image.frontend` and `image.backend` – container images.
- `firebaseSecretName` – name of the secret containing Firebase credentials.
  - `firebase.credentialsKey` is mounted for the backend and referenced by
    `GOOGLE_APPLICATION_CREDENTIALS`.
  - `firebase.configKey` is used for the `VITE_FIREBASE_CONFIG` environment
    variable of the frontend.
- `databaseUrl` – connection string used by the backend.
- `ingress` – configure ingress for the frontend service.
- `hpa` – enable CPU-based autoscaling for both deployments.

Create the secret before installing the chart:

```bash
kubectl create secret generic firebase-config \
  --from-file=service-account.json=</path/to/serviceAccount.json> \
  --from-file=firebase-config.json=</path/to/firebaseConfig.json>
```

Install the chart with:

```bash
helm install xslt charts/xslt-playground
```


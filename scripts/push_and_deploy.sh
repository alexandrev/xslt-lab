#!/usr/bin/env bash
# push_and_deploy.sh
# Pushes to main, waits for GitHub Actions to complete,
# then restarts the affected K8s pods.
set -euo pipefail

REPO="alexandrev/xslt-lab"
NAMESPACE="xslt-lab"
TOKEN=$(pass show github/xslt-lab-push-token)
TIMEOUT=600   # 10 min max
POLL=15       # seconds between checks

# ── 1. Push ────────────────────────────────────────────────────────────────
echo "→ Pushing to origin/main..."
git push origin main

COMMIT=$(git rev-parse HEAD)
echo "  Commit: ${COMMIT:0:7}"

# ── 2. Wait for runs triggered by this commit ──────────────────────────────
echo "→ Waiting for GitHub Actions..."
sleep 5   # give GH a moment to register the run

deadline=$(( $(date +%s) + TIMEOUT ))
docker_done=false
docker_conclusion=""

while true; do
  if [[ $(date +%s) -gt $deadline ]]; then
    echo "✗ Timeout waiting for Actions" >&2
    exit 1
  fi

  runs=$(curl -s \
    -H "Authorization: Bearer $TOKEN" \
    -H "Accept: application/vnd.github+json" \
    "https://api.github.com/repos/$REPO/actions/runs?head_sha=$COMMIT&per_page=20")

  total=$(echo "$runs" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d.get('total_count',0))")

  if [[ "$total" -eq 0 ]]; then
    echo "  No runs found yet, retrying..."
    sleep $POLL
    continue
  fi

  # Parse status of each run
  summary=$(echo "$runs" | python3 -c "
import json, sys
d = json.load(sys.stdin)
for r in d.get('workflow_runs', []):
    print(r['name'], '|', r['status'], '|', r.get('conclusion',''))
")

  echo "  Runs:"
  echo "$summary" | sed 's/^/    /'

  # Check if 'Publish Docker images' is done
  docker_status=$(echo "$summary" | grep "Publish Docker images" | awk -F'|' '{print $2}' | tr -d ' ')
  docker_concl=$(echo "$summary"  | grep "Publish Docker images" | awk -F'|' '{print $3}' | tr -d ' ')

  if [[ "$docker_status" == "completed" ]]; then
    docker_done=true
    docker_conclusion="$docker_concl"
    break
  fi

  echo "  Still running, checking again in ${POLL}s..."
  sleep $POLL
done

# ── 3. Check result ────────────────────────────────────────────────────────
if [[ "$docker_conclusion" != "success" ]]; then
  echo "✗ 'Publish Docker images' finished with: $docker_conclusion" >&2
  exit 1
fi

echo "✓ Docker images published successfully"

# ── 4. Restart pods ────────────────────────────────────────────────────────
echo "→ Restarting K8s deployments in namespace '$NAMESPACE'..."

kubectl rollout restart deployment/lab-xslt-playground-frontend -n "$NAMESPACE"
kubectl rollout restart deployment/lab-xslt-playground-backend  -n "$NAMESPACE"

echo "→ Waiting for rollouts..."
kubectl rollout status deployment/lab-xslt-playground-frontend -n "$NAMESPACE" --timeout=120s
kubectl rollout status deployment/lab-xslt-playground-backend  -n "$NAMESPACE" --timeout=120s

echo ""
echo "✓ Deploy complete — commit ${COMMIT:0:7} is live"

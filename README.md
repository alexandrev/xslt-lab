# xslt-lab

This repository hosts the Helm chart for the XSLT playground and now includes a Hugo-powered site for docs and updates.

## Layout
- `charts/` – Helm repository index and supporting assets (served as-is via GitHub Pages with `.nojekyll`).
- `xslt-playground-0.1.2.tgz` – packaged Helm chart referenced from `charts/index.yaml`.
- `site/` – Hugo source (content, layouts, CSS). Publishes to `docs/`.
- `docs/` – will contain generated static files after running Hugo; commit this folder if you want GitHub Pages to serve the site.

## Hugo workflow
1. Install Hugo (extended) locally, e.g. `brew install hugo` on macOS.
2. Build the static site to `docs/` without touching chart assets:\
   `hugo --source site --minify`
3. Preview locally with live reload:\
   `hugo server --source site --buildDrafts --watch`
4. Commit the generated `docs/` folder and push to GitHub. Point GitHub Pages at the `docs` directory so the site appears at `https://alexandrev.github.io/xslt-lab/`.

Content is written in Markdown under `site/content/`; layouts and styling live in `site/layouts/` and `site/static/`.

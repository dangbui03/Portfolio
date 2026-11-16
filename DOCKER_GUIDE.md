# Dockerization & Deployment Guide

This guide explains how the **Portfolio** Next.js application is packaged into a lightweight static Nginx Docker image and optionally exposed via a Cloudflare Tunnel (`cloudflared`).

---

## 1. Architecture Overview

The Docker setup uses a two-stage build defined in `Dockerfile` and orchestrated by `docker-compose.cloudflared.yml`:

1. **Stage 1 — Static Export Builder (`node:22-alpine`)**:
   - Installs dependencies (`npm install --no-audit --no-fund`).
   - Runs `npm run build` (`next build`).
   - Through `next.config.ts` (`output: "export"`, `distDir: "dist"`), Next.js prerenders all routes (`/`, `/about`, `/blog`, `/projects`, `/contact`) into static HTML/CSS/JS bundles inside `/app/dist`.
2. **Stage 2 — Production Web Server (`nginx:alpine`)**:
   - Copies `nginx.conf` to `/etc/nginx/conf.d/default.conf` (configured with `try_files $uri $uri/ /index.html;` so direct navigation and refreshes on sub-routes work cleanly).
   - Copies `/app/dist` from the builder stage into `/usr/share/nginx/html`.
   - Exposes port `80` inside the container (mapped to `8080` on the host by default).
3. **Cloudflare Tunnel Sidecar (`cloudflare/cloudflared:latest`)**:
   - Automatically creates a quick public HTTPS tunnel pointing to `http://web:80`.

---

## 2. Key Configuration Files

| File                               | Purpose                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `Dockerfile`                     | Multi-stage build (`node:22-alpine` -> `nginx:alpine`).                                             |
| `docker-compose.cloudflared.yml` | Runs the `web` service on port `8080` and `cloudflared` tunnel sidecar.                           |
| `next.config.ts`                 | Sets `output: "export"` and `distDir: "dist"` so Next.js emits static assets to `/app/dist`.      |
| `nginx.conf`                     | Configures Nginx static serving and SPA fallback routing on port `80`.                                |
| `.dockerignore`                  | Excludes `node_modules`, `.next`, `dist`, `backup`, and `.git` so build context stays ~17 KB. |

---

## 3. Prerequisites (Windows + WSL)

On this machine, the Docker daemon and `docker` CLI run inside **WSL (Windows Subsystem for Linux)**.

- If you are in **Windows PowerShell**, prefix Docker commands with `wsl -e sh -c "..."` (or enter WSL first by running `wsl`).
- If you are already inside a **WSL bash terminal**, run the `docker` commands directly.

---

## 4. Common Commands

### A. Build the Docker Image Only

From **Windows PowerShell**:

```powershell
wsl -e sh -c "cd /mnt/c/Users/user/source/Portfolio && docker compose -f docker-compose.cloudflared.yml build"
```

From **WSL Terminal**:

```bash
cd /mnt/c/Users/user/source/Portfolio
docker compose -f docker-compose.cloudflared.yml build
```

---

### B. Build and Start Containers in the Background

> **Note on Port 8080 Conflicts**: If an older project container (e.g., `replicatedesignfromimage-web-1`) is already bound to port `8080`, stop it first or override `WEB_PORT`.

1. **Check & stop any conflicting container on port 8080**:

   ```powershell
   wsl -e sh -c "docker ps"
   wsl -e sh -c "docker stop replicatedesignfromimage-web-1 replicatedesignfromimage-cloudflared-1"
   ```
2. **Start the Portfolio stack**:

   ```powershell
   wsl -e sh -c "cd /mnt/c/Users/user/source/Portfolio && docker compose -f docker-compose.cloudflared.yml up -d --build"
   ```

   *(Or run on a custom port such as `8081` without stopping existing containers)*:

   ```powershell
   wsl -e sh -c "cd /mnt/c/Users/user/source/Portfolio && WEB_PORT=8081 docker compose -f docker-compose.cloudflared.yml up -d --build"
   ```
3. **Open Locally**:
   Visit `http://localhost:8080` (or `http://localhost:8081` if using a custom `WEB_PORT`).

---

### C. Get the Public Cloudflare Tunnel URL (`*.trycloudflare.com`)

When `cloudflared` starts, it prints a temporary public HTTPS URL in its container logs:

```powershell
wsl -e sh -c "cd /mnt/c/Users/user/source/Portfolio && docker compose -f docker-compose.cloudflared.yml logs cloudflared | grep -E 'https://[-a-z0-9]+\.trycloudflare\.com'"
```

---

### D. Stop and Remove Containers

```powershell
wsl -e sh -c "cd /mnt/c/Users/user/source/Portfolio && docker compose -f docker-compose.cloudflared.yml down"
```

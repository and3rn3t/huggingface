# Cloudflare Pages Deployment Setup

This project is configured to deploy to Cloudflare Pages with custom domain `hug.andernet.dev`.

## Architecture

### API Proxy
The application uses a Cloudflare Pages Function (`functions/api/[[path]].ts`) to proxy requests to HuggingFace API. This solves CORS issues when calling the API from the browser.

**Proxy Routes:**
- `/api/*` → `https://huggingface.co/api/*`
- `/api/inference/*` → `https://api-inference.huggingface.co/models/*`

### Environment Variables

#### GitHub Secrets (Required for CI/CD)
Set these in: Repository → Settings → Secrets and variables → Actions

| Secret | Description | How to Get |
|--------|-------------|------------|
| `CLOUDFLARE_API_TOKEN` | API token for Cloudflare Pages | Cloudflare Dashboard → My Profile → API Tokens → Create Token with **Account \| Cloudflare Pages \| Edit** permission |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account ID | Found in Cloudflare dashboard URL after `/accounts/` |
| `VITE_HF_TOKEN` | HuggingFace API token (optional) | huggingface.co → Settings → Access Tokens |

#### Cloudflare Pages Environment Variables (Optional)
Set these in: Cloudflare Dashboard → Pages → `hug` → Settings → Environment Variables

| Variable | Description | Type |
|----------|-------------|------|
| `VITE_HF_TOKEN` | HuggingFace API token for server-side proxy | Secret (encrypted) |

> **Note:** Users can also set their HuggingFace token in the app's Settings UI. The environment variable is optional and serves as a fallback.

## Deployment

### Automatic (via GitHub Actions)
Push to `main` branch:
```bash
git push origin main
```

Pull requests automatically deploy to preview URLs: `https://<branch>.hug.pages.dev`

### Manual (via Wrangler CLI)
```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npm run build
wrangler pages deploy dist --project-name=hug
```

## Custom Domain Setup

1. **In Cloudflare Pages:**
   - Go to: Pages → `hug` → Custom domains
   - Click "Set up a custom domain"
   - Enter: `hug.andernet.dev`

2. **DNS Configuration:**
   - If `andernet.dev` is on Cloudflare: DNS is auto-configured
   - If using external DNS: Add CNAME record:
     ```
     hug  →  hug.pages.dev
     ```

3. **SSL:** Cloudflare automatically provisions SSL certificates (this may take a few minutes)

## Local Development

### Standard Development Server
```bash
npm run dev
```
Runs on `http://localhost:5173`

> **Note:** API requests will fail locally because the Cloudflare Functions proxy isn't available. You'll need to either:
> 1. Set `VITE_HF_TOKEN` in `.env.local` (token will be used client-side)
> 2. Use `wrangler pages dev` (see below)

### Development with Cloudflare Functions (Recommended)
```bash
# Build the app
npm run build

# Run with Wrangler
npx wrangler pages dev dist
```
This runs the built app with the Cloudflare Functions proxy available.

## Troubleshooting

### CORS Errors
If you see CORS errors, verify:
- API requests are going to `/api/*` not directly to `huggingface.co`
- The Pages Function is deployed (check Functions tab in Cloudflare dashboard)
- The proxy is working by testing: `https://hug.andernet.dev/api/models?limit=1`

### 401 Unauthorized
- Check if HuggingFace token is set (either in app Settings or as environment variable)
- Verify token is valid: https://huggingface.co/settings/tokens

### Environment Variables Not Working
- Build-time variables (`VITE_*`) are baked into the build, so redeploy after changing them
- Runtime variables (Pages Functions) take effect immediately but require a new request
- Check: Cloudflare Dashboard → Pages → `hug` → Settings → Environment Variables

## URLs

| Environment | URL |
|-------------|-----|
| Production | https://hug.andernet.dev |
| Cloudflare Pages | https://hug.pages.dev |
| PR Previews | https://`<commit>`.hug.pages.dev |

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/deploy.yml`) runs on:
- Push to `main` → Production deployment
- Pull requests → Preview deployment

**Pipeline Steps:**
1. Type check (`npm run type-check`)
2. Lint (`npm run lint`)
3. Build (`npm run build`)
4. Create Cloudflare Pages project (first run only)
5. Deploy to Cloudflare Pages

**Optimizations:**
- npm cache enabled (~30s faster builds)
- Concurrent runs cancelled on new push
- 10-minute timeout
- Fail fast: lint/type-check before build

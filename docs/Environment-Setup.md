# Environment Configuration Setup

## Overview

The application uses environment-based configuration to automatically select the correct config based on the deployment environment. This ensures that:

- **Local development** uses `NON_PROD_CONFIG`
- **Test branch** uses `NON_PROD_CONFIG`
- **Production/Master branch** uses `PROD_CONFIG`

## Environment Files

### `.env.local` (Local Development)

Used for local development on your machine.

```env
NEXT_PUBLIC_APP_ENV=local
```

**Status:** Ignored by git (not committed)

### `.env.production` (Production)

Used when deploying to production (master branch).

```env
NEXT_PUBLIC_APP_ENV=prod
```

**Status:** Committed to git

### `.env.example` (Template)

Template file showing available environment variables.

```env
NEXT_PUBLIC_APP_ENV=local
```

**Status:** Committed to git

## Configuration Selection Logic

The application automatically selects the appropriate configuration based on the `NEXT_PUBLIC_APP_ENV` environment variable:

```typescript
const appEnv = (process.env.APP_ENV ||
  process.env.NEXT_PUBLIC_APP_ENV ||
  APP_ENV.LOCAL) as AppEnvType;
const baseConfig: AppConfig = appEnv === APP_ENV.PROD ? PROD_CONFIG : NON_PROD_CONFIG;
```

### Environment Mapping

| Environment    | Branch                   | Env Variable                | Config Used       | API URL                     |
| -------------- | ------------------------ | --------------------------- | ----------------- | --------------------------- |
| **Local**      | any                      | `NEXT_PUBLIC_APP_ENV=local` | `NON_PROD_CONFIG` | `https://apitest.giddh.com` |
| **Test**       | `test`                   | `NEXT_PUBLIC_APP_ENV=local` | `NON_PROD_CONFIG` | `https://apitest.giddh.com` |
| **Production** | `master` or `production` | `NEXT_PUBLIC_APP_ENV=prod`  | `PROD_CONFIG`     | `https://api.giddh.com`     |

## Setup Instructions

### For Local Development

1. **Copy the example file:**

   ```bash
   cp .env.example .env.local
   ```

2. **Verify the content:**

   ```env
   NEXT_PUBLIC_APP_ENV=local
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Verify config:**
   - Open browser console
   - The app will use `NON_PROD_CONFIG`
   - API calls will go to `https://apitest.giddh.com`

### For Test Branch Deployment

1. **Ensure `.env.production` has:**

   ```env
   NEXT_PUBLIC_APP_ENV=local
   ```

2. **Deploy to test branch:**

   ```bash
   git checkout test
   git pull origin test
   # Deploy using your CI/CD pipeline
   ```

3. **Verify:**
   - App uses `NON_PROD_CONFIG`
   - API URL: `https://apitest.giddh.com`

### For Production Deployment

1. **Ensure `.env.production` has:**

   ```env
   NEXT_PUBLIC_APP_ENV=prod
   ```

2. **Deploy to production:**

   ```bash
   git checkout master
   git pull origin master
   # Deploy using your CI/CD pipeline
   ```

3. **Verify:**
   - App uses `PROD_CONFIG`
   - API URL: `https://api.giddh.com`

## Configuration Details

### NON_PROD_CONFIG (Local & Test)

```typescript
const NON_PROD_CONFIG: AppConfig = {
  REFERENCE_ID: "117230p1697093599652797df30cea",
  API_URL: "https://routes.msg91.com/api/proxy/117230/24lvqun1",
  REFERENCE_ID_UK: "117230d172709659666f16714325b0",
  API_URL_UK: "https://routes.msg91.com/api/proxy/117230/34ytsup2",
  GIDDH_API_URL: "https://apitest.giddh.com",
  PROXY_URL: "https://routes.msg91.com",
  PAYPAL_URL: "https://www.sandbox.paypal.com/cgi-bin/webscr",
  WEBSITE_DOMAIN: "https://web.giddh.com",
};
```

### PROD_CONFIG (Production)

```typescript
const PROD_CONFIG: AppConfig = {
  REFERENCE_ID: "117230e170290843965805217bfd25",
  API_URL: "https://routes.msg91.com/api/proxy/117230/24yrfox2",
  REFERENCE_ID_UK: "117230d172709659666f16714325b0",
  API_URL_UK: "https://routes.msg91.com/api/proxy/117230/34ytsup2",
  GIDDH_API_URL: "https://api.giddh.com",
  PROXY_URL: "https://routes.msg91.com",
  PAYPAL_URL: "https://www.paypal.com/cgi-bin/webscr",
  WEBSITE_DOMAIN: "https://giddh.com",
};
```

## Verifying Current Environment

### In Browser Console

```javascript
// Check current config
console.log("Environment:", process.env.NEXT_PUBLIC_APP_ENV);

// Check API URL being used
fetch("/api/config")
  .then((res) => res.json())
  .then((config) => console.log("Config:", config));
```

### In Code

```typescript
import { DEFAULT_CONFIG, APP_ENV } from "@/config";

console.log("Current Environment:", process.env.NEXT_PUBLIC_APP_ENV);
console.log("API URL:", DEFAULT_CONFIG.GIDDH_API_URL);
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches:
      - master
      - test

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set environment
        run: |
          if [ "${{ github.ref }}" == "refs/heads/master" ]; then
            echo "NEXT_PUBLIC_APP_ENV=prod" >> $GITHUB_ENV
          else
            echo "NEXT_PUBLIC_APP_ENV=local" >> $GITHUB_ENV
          fi

      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_APP_ENV: ${{ env.NEXT_PUBLIC_APP_ENV }}

      - name: Deploy
        run: # Your deployment command
```

### Vercel Deployment

1. **Go to Vercel Dashboard** → Your Project → Settings → Environment Variables

2. **Add for Production:**
   - Key: `NEXT_PUBLIC_APP_ENV`
   - Value: `prod`
   - Environment: Production

3. **Add for Preview (Test):**
   - Key: `NEXT_PUBLIC_APP_ENV`
   - Value: `local`
   - Environment: Preview

## Troubleshooting

### Issue: Wrong config being used

**Check:**

1. Verify `.env.local` or `.env.production` exists
2. Check the value of `NEXT_PUBLIC_APP_ENV`
3. Restart the development server
4. Clear Next.js cache: `rm -rf .next`

**Solution:**

```bash
# Stop the server
# Delete .next folder
rm -rf .next

# Verify env file
cat .env.local

# Restart
npm run dev
```

### Issue: Environment variable not loading

**Cause:** Next.js only loads env variables that start with `NEXT_PUBLIC_` on the client side.

**Solution:** Always use `NEXT_PUBLIC_APP_ENV`, not just `APP_ENV`.

### Issue: Changes not reflecting

**Cause:** Next.js caches environment variables.

**Solution:**

```bash
# Stop server
# Clear cache
rm -rf .next

# Restart
npm run dev
```

## Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` for a reason
2. **Always commit `.env.example`** - Helps other developers
3. **Always commit `.env.production`** - Needed for production builds
4. **Use `NEXT_PUBLIC_` prefix** - Required for client-side access
5. **Verify before deploying** - Check which config is being used
6. **Document changes** - Update this file when adding new env variables

## Security Notes

- ✅ Environment variables with `NEXT_PUBLIC_` prefix are **exposed to the browser**
- ✅ This is safe for our use case (config selection only)
- ⚠️ Never put sensitive data (API keys, secrets) in `NEXT_PUBLIC_` variables
- ✅ White-label data overrides these configs anyway (from API)

## Summary

| File              | Purpose                | Git Status | When Used       |
| ----------------- | ---------------------- | ---------- | --------------- |
| `.env.local`      | Local development      | Ignored    | `npm run dev`   |
| `.env.production` | Production build       | Committed  | `npm run build` |
| `.env.example`    | Template/Documentation | Committed  | Reference only  |

The environment system ensures the correct configuration is used automatically based on the deployment environment, with white-label API data taking precedence over all default configs.

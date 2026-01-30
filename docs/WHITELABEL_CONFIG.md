# White-Label Configuration System

## Overview

This system provides dynamic white-label configuration that fetches settings from an API on application load, with automatic fallback to default values if the API fails or times out (10 seconds).

## Quick Start

**Current Status: White-label feature is DISABLED by default**

The application currently uses default configuration values only. No API calls are made.

## Disabling/Enabling White-Label Feature

To control the white-label feature, modify the flag in `src/config/default.ts`:

```typescript
export const DEFAULT_CONFIG: AppConfig = {
  disableWhiteLabel: true, // Set to false to enable white-label API calls
  // ... other config
};
```

**When `disableWhiteLabel: true`:**

- ✅ No API calls are made
- ✅ App loads instantly with default config
- ✅ No timeout delays
- ✅ Perfect for development or when white-label is not needed

**When `disableWhiteLabel: false`:**

- API is called on app load
- 10-second timeout applies
- Falls back to defaults on failure

## Architecture

### Files Created

1. **`src/config/default.ts`** - Default configuration values
2. **`src/services/whitelabel.ts`** - API service with timeout and fallback logic (calls external API directly)
3. **`src/contexts/ConfigContext.tsx`** - React context provider for configuration
4. **`src/hooks/useAppConfig.ts`** - Custom hook for easy config access

## How It Works

### 1. Application Load

When the app loads, `ConfigProvider` in `src/app/layout.tsx` automatically:

- Calls the external whitelabel API directly (client-side fetch)
- Waits up to 10 seconds for response
- Falls back to default config if API fails or times out

**Note:** Since this project is frontend-only (no Next.js API routes), the whitelabel API is called directly from the browser.

### 2. Default Configuration

Located in `src/config/default.ts`:

```typescript
{
  REFERENCE_ID: "1362783l1767680954695cabba5ada1",
  GIDDH_API_URL: "https://apitest.giddh.com",
  PROXY_URL: "https://routes.msg91.com",
  API_URL: "https://routes.msg91.com/api/proxy/117230/24lvqun1",
  PAYPAL_URL: "https://www.sandbox.paypal.com/cgi-bin/webscr",
  REFERENCE_ID_UK: "117230d172709659666f16714325b0",
  API_URL_UK: "https://routes.msg91.com/api/proxy/117230/34ytsup2"
}
```

### 3. Timeout & Fallback

- **Timeout**: 10 seconds (configurable in `src/services/whitelabel.ts`)
- **Fallback**: Automatic fallback to default config on timeout or error
- **Partial Response**: If API returns partial data, missing fields use defaults

## Usage in Components

```typescript
import { useAppConfig } from "@/hooks/useAppConfig";

function MyComponent() {
  const { config, isLoading, error, apiUrl, referenceId } = useAppConfig();

  if (isLoading) {
    return <div>Loading configuration...</div>;
  }

  // Use config values
  return <div>API URL: {apiUrl}</div>;
}
```

## AWS CodePipeline Setup

### Environment Variables (When White-Label is Enabled)

If you enable white-label feature (`disableWhiteLabel: false`), you'll need to set:

```bash
WHITELABEL_API_URL=https://your-whitelabel-api.com/config
```

**Important:** Must use `` prefix for client-side access.

**Current Status:** White-label is disabled, so no environment variables are needed. All configuration is hardcoded in `src/config/default.ts`.

### Current buildspec.yml in AWS Console

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 24
    commands:
      - echo "Installing dependencies"
      - node -v
      - npm -v
      - npm ci

  build:
    commands:
      - echo "Building Next.js app"
      - npm run build

  post_build:
    commands:
      - echo "Build completed"

artifacts:
  files:
    - .next/**/*
    - public/**/*
    - package.json
    - package-lock.json
    - next.config.js

cache:
  paths:
    - node_modules/**/*
    - ~/.npm/**/*
```

**No changes needed to buildspec.yml** - the white-label configuration is handled at runtime, not build time.

## API Response Format

Your whitelabel API should return JSON:

```json
{
  "REFERENCE_ID": "custom-value",
  "GIDDH_API_URL": "https://custom-api.com",
  "PROXY_URL": "https://custom-proxy.com",
  "API_URL": "https://custom-api.com/proxy",
  "PAYPAL_URL": "https://paypal.com/custom",
  "REFERENCE_ID_UK": "uk-custom-value",
  "API_URL_UK": "https://custom-api-uk.com"
}
```

## Benefits

✅ **Runtime Configuration** - No rebuild needed for config changes  
✅ **Automatic Fallback** - Always works even if API is down  
✅ **10s Timeout** - Fast failure, doesn't block app loading  
✅ **Type-Safe** - Full TypeScript support  
✅ **Easy to Use** - Simple hook interface  
✅ **No Build Changes** - Works with existing AWS CodePipeline setup

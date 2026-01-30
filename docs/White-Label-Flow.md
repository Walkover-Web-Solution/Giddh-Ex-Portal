# White-Label Configuration Flow

## Overview

The white-label configuration system allows the application to dynamically load and apply custom branding and configuration from an API endpoint. This document explains the complete flow of how white-label data is fetched, stored, and used throughout the application.

## Architecture

### Key Components

1. **ConfigProvider** (`src/contexts/ConfigContext.tsx`) - Manages config state and white-label data fetching
2. **Config Files** (`src/config/default.ts`) - Defines config interfaces and merge logic
3. **Utilities** - Use `getConfig()` to access dynamic config
4. **Components** - Use `useConfig()` hook to access config

### Configuration Hierarchy

```
PROD_CONFIG (Production)
    ↓
NON_PROD_CONFIG (Local/Test)
    ↓
FALLBACK_CONFIG (Safety net)
    ↓
White-Label Data (API Override)
```

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         APPLICATION STARTS                           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    ConfigProvider Initializes                        │
│                                                                       │
│  Step 1: Check localStorage for 'whiteLabel' key                    │
│  Step 2: Parse stored data (if exists)                              │
│  Step 3: Merge with FALLBACK_CONFIG                                 │
│  Step 4: Set initial config state                                   │
│                                                                       │
│  Initial Config = mergeWhiteLabelConfig(storedWhiteLabel)           │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
         ┌──────────────────┐  ┌──────────────────────┐
         │  Components      │  │  Background Fetch    │
         │  Render          │  │                      │
         │                  │  │  GET /whitelabel     │
         │  - useConfig()   │  │  from GIDDH_API_URL  │
         │  - config ready  │  │                      │
         │  - isLoading=true│  │                      │
         └──────────────────┘  └──────────┬───────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                                             │
                    ▼                                             ▼
         ┌──────────────────────┐                   ┌──────────────────────┐
         │  API Success         │                   │  API Failed          │
         │                      │                   │                      │
         │  1. Parse response   │                   │  1. Log error        │
         │  2. Extract body     │                   │  2. Set error state  │
         │  3. Save to          │                   │  3. Keep using       │
         │     localStorage     │                   │     cached data      │
         │  4. Merge with       │                   │                      │
         │     FALLBACK_CONFIG  │                   │                      │
         └──────────┬───────────┘                   └──────────┬───────────┘
                    │                                           │
                    └───────────────┬───────────────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────┐
                    │  Update Config State       │
                    │                            │
                    │  setConfig(mergedConfig)   │
                    │  setIsLoading(false)       │
                    └─────────┬──────────────────┘
                              │
                              ▼
                    ┌──────────────────────────┐
                    │  Components Re-render    │
                    │                          │
                    │  - Fresh config applied  │
                    │  - isLoading = false     │
                    │  - UI updates            │
                    └──────────────────────────┘
```

## Utility Functions Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              Utility Function Needs Config                           │
│              (e.g., getDetails, verifyPortalUser)                    │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Call getConfig()    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Check Environment   │
                    └──────────┬───────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
         ┌──────────────────┐  ┌──────────────────────┐
         │  Server Side     │  │  Client Side         │
         │  (SSR/SSG)       │  │  (Browser)           │
         │                  │  │                      │
         │  Return          │  │  Read localStorage   │
         │  DEFAULT_CONFIG  │  │  'whiteLabel'        │
         └──────────────────┘  └──────────┬───────────┘
                                          │
                               ┌──────────┴──────────┐
                               │                     │
                               ▼                     ▼
                    ┌──────────────────┐  ┌──────────────────┐
                    │  Data Found      │  │  No Data         │
                    │                  │  │                  │
                    │  Parse JSON      │  │  Return          │
                    │  Merge with      │  │  FALLBACK_CONFIG │
                    │  FALLBACK_CONFIG │  │                  │
                    └────────┬─────────┘  └────────┬─────────┘
                             │                      │
                             └──────────┬───────────┘
                                        │
                                        ▼
                             ┌──────────────────────┐
                             │  Return Merged       │
                             │  Config              │
                             │                      │
                             │  All values filled   │
                             │  from white-label    │
                             │  or FALLBACK_CONFIG  │
                             └──────────────────────┘
```

## Data Flow

### 1. Initial Load

```typescript
// ConfigProvider initialization
const storedWhiteLabel = getStoredWhiteLabel();
const initialConfig = mergeWhiteLabelConfig(storedWhiteLabel);
const [config, setConfig] = useState<AppConfig>(initialConfig);
```

**Result:** Components have valid config immediately from localStorage cache.

### 2. API Fetch

```typescript
// Background fetch
const response = await fetch(`${DEFAULT_CONFIG.GIDDH_API_URL}/whitelabel`);
const data = await response.json();

if (data?.body) {
  whiteLabelData = data.body;
  localStorage.setItem("whiteLabel", JSON.stringify(whiteLabelData));
}
```

**Result:** Fresh data fetched and stored for next session.

### 3. Config Merge

```typescript
export function mergeWhiteLabelConfig(whiteLabel: WhiteLabelConfig | null): AppConfig {
  if (!whiteLabel) {
    return FALLBACK_CONFIG;
  }

  const giddhWhiteLabel = whiteLabel.giddhWhiteLabel;

  return {
    ...FALLBACK_CONFIG,
    PROXY_URL: whiteLabel.proxyUrl || FALLBACK_CONFIG.PROXY_URL,
    API_URL: whiteLabel.proxyApiUrl || FALLBACK_CONFIG.API_URL,
    API_URL_UK: whiteLabel.proxyApiUrlUk || FALLBACK_CONFIG.API_URL_UK,
    REFERENCE_ID: whiteLabel.proxyReferenceId || FALLBACK_CONFIG.REFERENCE_ID,
    REFERENCE_ID_UK: whiteLabel.proxyReferenceIdUk || FALLBACK_CONFIG.REFERENCE_ID_UK,
    WEBSITE_DOMAIN: whiteLabel.websiteDomain || FALLBACK_CONFIG.WEBSITE_DOMAIN,
    GIDDH_API_URL: giddhWhiteLabel?.apiDomain || FALLBACK_CONFIG.GIDDH_API_URL,
  };
}
```

**Result:** White-label values override defaults, FALLBACK_CONFIG fills gaps.

## White-Label API Response Structure

### Expected Response Format

```json
{
  "status": "success",
  "body": {
    "proxyReferenceId": "117230p1697093599652797df30cea",
    "proxyUrl": "https://routes.msg91.com",
    "proxyApiUrl": "https://routes.msg91.com/api/proxy/117230/24lvqun1",
    "proxyReferenceIdUk": "117230d172709659666f16714325b0",
    "proxyApiUrlUk": "https://routes.msg91.com/api/proxy/117230/34ytsup2",
    "websiteDomain": "https://web.giddh.com",
    "giddhWhiteLabel": {
      "uniqueName": "91368c94526a0e27c91b976e72808f16",
      "baseDomain": "https://test.giddh.com",
      "certificateRequired": true,
      "certificateStatus": "ISSUED",
      "domainName": "http://localhost:3000",
      "logo": "",
      "apiDomain": "https://apitest.giddh.com",
      "adminDomain": "https://vtest.giddh.com",
      "uiDomains": [
        "https://test.giddh.com",
        "https://web.giddh.com",
        "https://stage.giddh.com",
        "http://localhost:3000"
      ],
      "portalDomain": "https://testportal.giddh.com"
    }
  }
}
```

### Field Mapping

| White-Label Key              | Config Key        | Description             |
| ---------------------------- | ----------------- | ----------------------- |
| `proxyUrl`                   | `PROXY_URL`       | MSG91 Proxy Base URL    |
| `proxyApiUrl`                | `API_URL`         | MSG91 API Proxy URL     |
| `proxyApiUrlUk`              | `API_URL_UK`      | MSG91 UK API Proxy URL  |
| `proxyReferenceId`           | `REFERENCE_ID`    | MSG91 Reference ID      |
| `proxyReferenceIdUk`         | `REFERENCE_ID_UK` | MSG91 UK Reference ID   |
| `websiteDomain`              | `WEBSITE_DOMAIN`  | Main website domain     |
| `giddhWhiteLabel.baseDomain` | `WEBSITE_DOMAIN`  | Fallback website domain |
| `giddhWhiteLabel.apiDomain`  | `GIDDH_API_URL`   | Giddh API base URL      |

## Usage Examples

### In React Components

```typescript
import { useConfig } from "@/contexts/ConfigContext";

function MyComponent() {
  const { config, isLoading, error } = useConfig();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <p>API URL: {config.API_URL}</p>
      <p>Website: {config.WEBSITE_DOMAIN}</p>
    </div>
  );
}
```

### In Utility Functions

```typescript
import { getConfig } from "@/config";

export const getDetails = async (token: string) => {
  const config = getConfig();
  const baseUrl = config.PROXY_URL.replace(/\/$/, "");

  const response = await axios.get(`${baseUrl}/api/c/getDetails`, {
    headers: { proxy_auth_token: token },
  });

  return response.data;
};
```

### Using the Hook

```typescript
import { useAppConfig } from "@/hooks/useAppConfig";

function LoginPage() {
  const { referenceId, isLoading } = useAppConfig();

  useEffect(() => {
    if (!isLoading && referenceId) {
      initVerification({ referenceId });
    }
  }, [referenceId, isLoading]);
}
```

## Error Handling

### Scenario 1: API Fails, No Cache

```
API Request → Fails → No localStorage → Returns FALLBACK_CONFIG
```

**Result:** App works with hardcoded default values.

### Scenario 2: API Fails, Has Cache

```
API Request → Fails → Has localStorage → Returns cached + FALLBACK_CONFIG
```

**Result:** App works with last known white-label values.

### Scenario 3: Invalid Cache Data

```
localStorage → Invalid JSON → Catch error → Returns FALLBACK_CONFIG
```

**Result:** App works with hardcoded default values.

## Configuration Files

### PROD_CONFIG

Used when `APP_ENV=prod`

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

### NON_PROD_CONFIG

Used when `APP_ENV=local` (default)

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

### FALLBACK_CONFIG

Safety net when white-label data is unavailable

```typescript
const FALLBACK_CONFIG: AppConfig = {
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

## Best Practices

### 1. Always Use Config Context in Components

✅ **Good:**

```typescript
const { config } = useConfig();
const url = config.API_URL;
```

❌ **Bad:**

```typescript
import { config } from "@/config";
const url = config.API_URL; // Static, won't update
```

### 2. Use getConfig() in Utilities

✅ **Good:**

```typescript
export const myUtility = () => {
  const config = getConfig(); // Dynamic
  return config.API_URL;
};
```

❌ **Bad:**

```typescript
import { config } from "@/config";
export const myUtility = () => {
  return config.API_URL; // Static
};
```

### 3. Wait for Config Loading

✅ **Good:**

```typescript
const { config, isLoading } = useConfig();

useEffect(() => {
  if (!isLoading) {
    makeApiCall(config.API_URL);
  }
}, [isLoading, config]);
```

❌ **Bad:**

```typescript
const { config } = useConfig();
makeApiCall(config.API_URL); // Might use empty values
```

## Troubleshooting

### Issue: Empty Config Values

**Cause:** White-label API failed and no localStorage cache exists.

**Solution:** FALLBACK_CONFIG ensures this never happens. Check if FALLBACK_CONFIG has valid values.

### Issue: Config Not Updating

**Cause:** Using static `config` import instead of `useConfig()` or `getConfig()`.

**Solution:** Use `useConfig()` in components or `getConfig()` in utilities.

### Issue: API Fails Silently

**Cause:** Error is caught but not displayed.

**Solution:** Check `error` state from `useConfig()`:

```typescript
const { config, error } = useConfig();

if (error) {
  console.error("Config error:", error);
}
```

## Summary

The white-label configuration system provides:

- ✅ **Dynamic Configuration** - Updates from API without code changes
- ✅ **Offline Support** - Works with localStorage cache
- ✅ **Fallback Safety** - FALLBACK_CONFIG ensures app never breaks
- ✅ **Type Safety** - Full TypeScript support
- ✅ **Performance** - Cached data loads instantly
- ✅ **Error Resilience** - Graceful degradation on API failures

The system is production-ready and handles all edge cases automatically.

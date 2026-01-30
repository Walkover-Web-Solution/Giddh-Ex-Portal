# AWS CodeBuild Configuration (Direct AWS Setup)

## Overview

This configuration is to be added **directly in AWS CodeBuild console**, not as a file in your repository.

## Branch Configuration Rules

- **PRODUCTION_BRANCH = "production"** → Uses `PROD_CONFIG` (api.giddh.com)
- **TEST_BRANCH = "test"** → Uses `NON_PROD_CONFIG` (apitest.giddh.com)
- **All other branches** → Uses `NON_PROD_CONFIG` (apitest.giddh.com)

## AWS CodeBuild YAML Configuration

Copy and paste this YAML directly into AWS CodeBuild console:

### Buildspec YAML (For AWS Console)

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

  pre_build:
    commands:
      - echo "Detecting branch and setting environment"
      - echo "Branch ref = $CODEBUILD_WEBHOOK_HEAD_REF"
      - echo "Source version = $CODEBUILD_SOURCE_VERSION"
      - |
        if [ "$CODEBUILD_WEBHOOK_HEAD_REF" = "refs/heads/production" ]; then
          export NEXT_PUBLIC_APP_ENV=prod
          echo "✓ Building for PRODUCTION branch"
          echo "✓ Using PROD_CONFIG"
          echo "✓ API URL: https://api.giddh.com"
        else
          export NEXT_PUBLIC_APP_ENV=local
          echo "✓ Building for TEST/DEV branch"
          echo "✓ Using NON_PROD_CONFIG"
          echo "✓ API URL: https://apitest.giddh.com"
        fi
      - echo "NEXT_PUBLIC_APP_ENV = $NEXT_PUBLIC_APP_ENV"

  build:
    commands:
      - echo "Building Next.js application"
      - npm run build

  post_build:
    commands:
      - echo "Build completed successfully"
      - |
        if [ "$NEXT_PUBLIC_APP_ENV" = "prod" ]; then
          echo "Deployed with PROD_CONFIG (api.giddh.com)"
        else
          echo "Deployed with NON_PROD_CONFIG (apitest.giddh.com)"
        fi

artifacts:
  files:
    - .next/**/*
    - public/**/*
    - package.json
    - package-lock.json
    - next.config.ts
    - .env.production

cache:
  paths:
    - node_modules/**/*
    - ~/.npm/**/*
```

## Step-by-Step Setup in AWS Console

### 1. Create CodeBuild Project

1. Go to **AWS CodeBuild Console**
2. Click **Create build project**
3. Fill in the details:

   **Project configuration:**
   - Project name: `giddh-portal-build`
   - Description: `Giddh Portal Next.js Build`

   **Source:**
   - Source provider: `GitHub`
   - Repository: Connect to your GitHub repository
   - Source version: Leave empty (webhook will handle branches)

   **Environment:**
   - Environment image: `Managed image`
   - Operating system: `Amazon Linux 2`
   - Runtime(s): `Standard`
   - Image: `aws/codebuild/standard:7.0`
   - Image version: `Always use the latest image`
   - Environment type: `Linux`
   - Privileged: Unchecked
   - Service role: Create new or use existing

   **Buildspec:**
   - Build specifications: `Insert build commands`
   - Click **Switch to editor**
   - **Paste the YAML configuration from above**

   **Artifacts:**
   - Type: `No artifacts` (or configure based on your deployment)

   **Logs:**
   - CloudWatch logs: Enabled
   - Group name: `/aws/codebuild/giddh-portal`
   - Stream name: Leave default

4. Click **Create build project**

### 2. Configure Webhook for Automatic Builds

1. In your CodeBuild project, go to **Build details** tab
2. Scroll to **Primary source webhook events**
3. Click **Update webhook**
4. Configure:
   - **Webhook**: Check "Rebuild every time a code change is pushed to this repository"
   - **Event type**: `PUSH`
   - **Branch filter (optional)**:
     - Type: `Branch name`
     - Pattern: `^(production|test|master|main)$`
     - This will only trigger builds for these branches

5. Click **Update webhook**

### 3. Test the Configuration

#### Test with 'test' branch:

```bash
git checkout test
git commit --allow-empty -m "Test build with NON_PROD_CONFIG"
git push origin test
```

**Expected in CodeBuild logs:**

```
✓ Building for TEST/DEV branch
✓ Using NON_PROD_CONFIG
✓ API URL: https://apitest.giddh.com
NEXT_PUBLIC_APP_ENV = local
```

#### Test with 'production' branch:

```bash
git checkout production
git commit --allow-empty -m "Test build with PROD_CONFIG"
git push origin production
```

**Expected in CodeBuild logs:**

```
✓ Building for PRODUCTION branch
✓ Using PROD_CONFIG
✓ API URL: https://api.giddh.com
NEXT_PUBLIC_APP_ENV = prod
```

## Environment Variable Logic

```
Branch = "production"
  → NEXT_PUBLIC_APP_ENV = prod
  → Uses PROD_CONFIG
  → API: api.giddh.com

Branch = "test" OR any other branch
  → NEXT_PUBLIC_APP_ENV = local
  → Uses NON_PROD_CONFIG
  → API: apitest.giddh.com
```

## Alternative: Using AWS Environment Variables

If you prefer to set environment variables in AWS Console instead of buildspec:

### For Production Build Project:

1. Go to your CodeBuild project
2. Click **Edit** → **Environment**
3. Scroll to **Additional configuration**
4. Add environment variable:
   - Name: `NEXT_PUBLIC_APP_ENV`
   - Value: `prod`
   - Type: `Plaintext`

### For Test Build Project:

1. Create a separate CodeBuild project for test
2. Add environment variable:
   - Name: `NEXT_PUBLIC_APP_ENV`
   - Value: `local`
   - Type: `Plaintext`

Then simplify your buildspec to:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 24
    commands:
      - npm ci

  build:
    commands:
      - echo "Building with NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV"
      - npm run build

artifacts:
  files:
    - .next/**/*
    - public/**/*
    - package.json
    - package-lock.json
    - next.config.ts
```

## Verification Checklist

After setup, verify:

- [ ] CodeBuild project created
- [ ] Buildspec YAML pasted in AWS console
- [ ] Webhook configured for GitHub
- [ ] Branch filter set (optional but recommended)
- [ ] Test build triggered successfully
- [ ] Production build triggered successfully
- [ ] Correct config used in each build (check logs)

## Troubleshooting

### Issue: Branch not detected

**Check:**

```yaml
pre_build:
  commands:
    - echo "Branch ref = $CODEBUILD_WEBHOOK_HEAD_REF"
    - echo "Source version = $CODEBUILD_SOURCE_VERSION"
```

**Common values:**

- `$CODEBUILD_WEBHOOK_HEAD_REF` = `refs/heads/production`
- `$CODEBUILD_WEBHOOK_HEAD_REF` = `refs/heads/test`

### Issue: Wrong config being used

**Verify in build logs:**

```
NEXT_PUBLIC_APP_ENV = prod  (for production)
NEXT_PUBLIC_APP_ENV = local (for test/other)
```

If wrong, check the branch detection logic in `pre_build` phase.

### Issue: Environment variable not available at build time

**Ensure** the variable is exported **before** `npm run build`:

```yaml
pre_build:
  commands:
    - export NEXT_PUBLIC_APP_ENV=prod
    - echo "Set to: $NEXT_PUBLIC_APP_ENV"

build:
  commands:
    - npm run build # Variable is now available
```

## Summary

| Branch                   | Environment Variable        | Config Used       | API URL                     |
| ------------------------ | --------------------------- | ----------------- | --------------------------- |
| `production`             | `NEXT_PUBLIC_APP_ENV=prod`  | `PROD_CONFIG`     | `https://api.giddh.com`     |
| `test`                   | `NEXT_PUBLIC_APP_ENV=local` | `NON_PROD_CONFIG` | `https://apitest.giddh.com` |
| `main`, `master`, others | `NEXT_PUBLIC_APP_ENV=local` | `NON_PROD_CONFIG` | `https://apitest.giddh.com` |

**Key Points:**

- ✅ No buildspec files in repository
- ✅ Configuration managed entirely in AWS Console
- ✅ Automatic branch detection
- ✅ Only `production` branch uses PROD_CONFIG
- ✅ All other branches use NON_PROD_CONFIG

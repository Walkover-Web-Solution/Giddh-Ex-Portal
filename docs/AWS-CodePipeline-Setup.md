# AWS CodePipeline Setup Guide

## Overview

This guide explains how to configure AWS CodePipeline to automatically use the correct configuration based on the branch being deployed.

## Branch-Based Configuration

| Branch                | Buildspec File       | Environment Variable        | Config Used       | API URL                     |
| --------------------- | -------------------- | --------------------------- | ----------------- | --------------------------- |
| **test**              | `buildspec-test.yml` | `NEXT_PUBLIC_APP_ENV=local` | `NON_PROD_CONFIG` | `https://apitest.giddh.com` |
| **master/production** | `buildspec-prod.yml` | `NEXT_PUBLIC_APP_ENV=prod`  | `PROD_CONFIG`     | `https://api.giddh.com`     |

## Buildspec Files

### Option 1: Single Buildspec with Branch Detection (Recommended)

**File:** `buildspec.yml`

This file automatically detects the branch and sets the appropriate environment variable:

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 24
    commands:
      - echo "Installing dependencies"
      - npm ci

  pre_build:
    commands:
      - echo "Setting environment variables based on branch"
      - |
        if [ "$CODEBUILD_WEBHOOK_HEAD_REF" = "refs/heads/master" ] || [ "$CODEBUILD_WEBHOOK_HEAD_REF" = "refs/heads/production" ]; then
          export NEXT_PUBLIC_APP_ENV=prod
          echo "Building for PRODUCTION with PROD_CONFIG"
        elif [ "$CODEBUILD_WEBHOOK_HEAD_REF" = "refs/heads/test" ]; then
          export NEXT_PUBLIC_APP_ENV=local
          echo "Building for TEST with NON_PROD_CONFIG"
        else
          export NEXT_PUBLIC_APP_ENV=local
          echo "Building for LOCAL/TEST with NON_PROD_CONFIG"
        fi
      - echo "NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV"

  build:
    commands:
      - echo "Building Next.js app"
      - npm run build

  post_build:
    commands:
      - echo "Build completed"
      - echo "Environment was set to $NEXT_PUBLIC_APP_ENV"

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

**How it works:**

- Uses `$CODEBUILD_WEBHOOK_HEAD_REF` to detect the branch
- Sets `NEXT_PUBLIC_APP_ENV=prod` for master/production branches
- Sets `NEXT_PUBLIC_APP_ENV=local` for test and other branches
- The environment variable is available during the build process

### Option 2: Separate Buildspec Files

If you prefer separate files for clarity:

#### For Test Branch: `buildspec-test.yml`

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 24
    commands:
      - npm ci

  pre_build:
    commands:
      - export NEXT_PUBLIC_APP_ENV=local
      - echo "Building for TEST with NON_PROD_CONFIG"

  build:
    commands:
      - npm run build

artifacts:
  files:
    - .next/**/*
    - public/**/*
    - package.json
    - package-lock.json
    - next.config.ts
    - .env.production
```

#### For Production Branch: `buildspec-prod.yml`

```yaml
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 24
    commands:
      - npm ci

  pre_build:
    commands:
      - export NEXT_PUBLIC_APP_ENV=prod
      - echo "Building for PRODUCTION with PROD_CONFIG"

  build:
    commands:
      - npm run build

artifacts:
  files:
    - .next/**/*
    - public/**/*
    - package.json
    - package-lock.json
    - next.config.ts
    - .env.production
```

## AWS CodePipeline Configuration

### Method 1: Using Single Buildspec (Recommended)

1. **Create CodePipeline Project:**
   - Go to AWS CodeBuild → Create build project
   - Name: `giddh-portal-build`
   - Source: GitHub (connect your repository)
   - Buildspec: Use `buildspec.yml` from repository

2. **Configure Webhook:**
   - Enable webhook for GitHub
   - Event type: `PUSH` and `PULL_REQUEST_MERGED`
   - Branch filter: `^(master|production|test)$`

3. **Environment Variables (Optional):**
   - No additional environment variables needed
   - The buildspec automatically detects the branch

### Method 2: Using Separate Buildspec Files

1. **Create Two CodeBuild Projects:**

   **Test Project:**
   - Name: `giddh-portal-test`
   - Source: GitHub (branch: `test`)
   - Buildspec: `buildspec-test.yml`
   - Environment variable: `NEXT_PUBLIC_APP_ENV=local`

   **Production Project:**
   - Name: `giddh-portal-prod`
   - Source: GitHub (branch: `master`)
   - Buildspec: `buildspec-prod.yml`
   - Environment variable: `NEXT_PUBLIC_APP_ENV=prod`

2. **Configure Webhooks:**
   - Test project: Trigger on `test` branch
   - Production project: Trigger on `master` or `production` branch

## Environment Variables in AWS CodeBuild

### Setting Environment Variables in AWS Console

1. Go to AWS CodeBuild → Your Project → Edit → Environment
2. Add environment variable:
   - Name: `NEXT_PUBLIC_APP_ENV`
   - Value: `local` (for test) or `prod` (for production)
   - Type: Plaintext

### Using Parameter Store (Advanced)

For sensitive configuration:

1. Store in AWS Systems Manager Parameter Store:

   ```bash
   aws ssm put-parameter \
     --name "/giddh-portal/test/app-env" \
     --value "local" \
     --type "String"

   aws ssm put-parameter \
     --name "/giddh-portal/prod/app-env" \
     --value "prod" \
     --type "String"
   ```

2. Update buildspec to fetch from Parameter Store:
   ```yaml
   pre_build:
     commands:
       - export NEXT_PUBLIC_APP_ENV=$(aws ssm get-parameter --name "/giddh-portal/$BRANCH/app-env" --query "Parameter.Value" --output text)
   ```

## Verification

### Check Build Logs

After deployment, check the CodeBuild logs:

**For Test Branch:**

```
Building for TEST with NON_PROD_CONFIG
NEXT_PUBLIC_APP_ENV=local
```

**For Production Branch:**

```
Building for PRODUCTION with PROD_CONFIG
NEXT_PUBLIC_APP_ENV=prod
```

### Verify in Application

After deployment, check the application:

```javascript
// In browser console
console.log("Environment:", process.env.NEXT_PUBLIC_APP_ENV);

// Check API URL being used
fetch("/api/health")
  .then((res) => res.json())
  .then((data) => console.log("Config:", data));
```

## Troubleshooting

### Issue: Wrong config being used

**Check:**

1. Verify `NEXT_PUBLIC_APP_ENV` is set in buildspec
2. Check CodeBuild logs for environment variable value
3. Ensure the variable is exported before `npm run build`

**Solution:**

```yaml
pre_build:
  commands:
    - export NEXT_PUBLIC_APP_ENV=prod
    - echo "NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV" # Verify it's set
```

### Issue: Environment variable not available at runtime

**Cause:** Next.js only bundles `NEXT_PUBLIC_*` variables at build time.

**Solution:** Ensure the variable is set **before** running `npm run build`:

```yaml
build:
  commands:
    - export NEXT_PUBLIC_APP_ENV=prod # Set before build
    - npm run build
```

### Issue: Branch detection not working

**Check:**

1. Verify `$CODEBUILD_WEBHOOK_HEAD_REF` is available
2. Check the exact branch name format

**Debug:**

```yaml
pre_build:
  commands:
    - echo "Branch ref: $CODEBUILD_WEBHOOK_HEAD_REF"
    - echo "Source version: $CODEBUILD_SOURCE_VERSION"
```

## Complete AWS CodePipeline Setup

### Step-by-Step Guide

1. **Push buildspec.yml to repository:**

   ```bash
   git add buildspec.yml
   git commit -m "Add AWS CodeBuild configuration"
   git push origin test
   ```

2. **Create CodeBuild Project:**
   - AWS Console → CodeBuild → Create build project
   - Project name: `giddh-portal`
   - Source provider: GitHub
   - Repository: Select your repository
   - Branch: Leave empty (webhook will handle branches)
   - Buildspec: `buildspec.yml`

3. **Configure Build Environment:**
   - Environment image: Managed image
   - Operating system: Amazon Linux 2
   - Runtime: Standard
   - Image: `aws/codebuild/standard:7.0`
   - Compute: 3 GB memory, 2 vCPUs

4. **Enable Webhook:**
   - Check "Rebuild every time a code change is pushed"
   - Event type: PUSH
   - Branch filter: `^(master|production|test)$`

5. **Create CodePipeline:**
   - AWS Console → CodePipeline → Create pipeline
   - Pipeline name: `giddh-portal-pipeline`
   - Source: GitHub (connect to your repo)
   - Build: Use the CodeBuild project created above
   - Deploy: Configure your deployment target (S3, EC2, etc.)

6. **Test the Setup:**

   ```bash
   # Push to test branch
   git checkout test
   git push origin test
   # Should build with NON_PROD_CONFIG

   # Push to master branch
   git checkout master
   git push origin master
   # Should build with PROD_CONFIG
   ```

## Best Practices

1. **Use Single Buildspec:** Easier to maintain, automatic branch detection
2. **Log Environment Variables:** Always echo the environment variable in pre_build
3. **Verify After Build:** Check build logs to confirm correct config was used
4. **Use Branch Filters:** Only trigger builds for specific branches
5. **Cache Dependencies:** Use cache to speed up builds
6. **Monitor Builds:** Set up CloudWatch alarms for build failures

## Summary

| Setup Method                               | Pros                                                                   | Cons                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Single buildspec with branch detection** | ✅ Easy to maintain<br>✅ Automatic detection<br>✅ One file to manage | ⚠️ Requires branch ref variable                            |
| **Separate buildspec files**               | ✅ Explicit configuration<br>✅ Clear separation                       | ⚠️ Multiple files to maintain<br>⚠️ Need separate projects |
| **Environment variables in AWS**           | ✅ No code changes needed<br>✅ Centralized config                     | ⚠️ Requires AWS console access<br>⚠️ Less visible in code  |

**Recommended:** Use single `buildspec.yml` with branch detection for simplicity and maintainability.

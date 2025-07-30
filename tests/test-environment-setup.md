# Automated Test Environment Setup

This guide describes how to quickly set up a complete Elementor testing environment using the current branch code.

## Quick Start

### One-Command Setup

```bash
npm run env:setup
```

This single command will:
- Clean up existing Docker containers
- Install all dependencies
- Build Elementor from your current branch
- Download the hello-elementor theme
- Start WordPress environments on ports 8888 and 8889
- Configure WordPress with Elementor settings
- Import test templates and sample data

### Setup with Playwright

```bash
npm run env:setup:with-playwright
```

Same as above plus installs Playwright for end-to-end testing.

## Access Your Environment

After successful setup:

- **WordPress 8888**: http://localhost:8888
- **WordPress 8889**: http://localhost:8889
- **Admin Panel**: http://localhost:8888/wp-admin/ (and 8889)
- **Username**: admin
- **Password**: password

## What Gets Set Up

### WordPress Configuration
- WordPress and PHP versions as defined in `tests/playwright/.playwright-wp-lite-env.json`
- Elementor plugin activated (built from current branch)
- Hello Elementor theme activated
- Clean URL structure (`/%postname%/`)
- Disabled welcome popups and guides
- Sample test data imported

### Development Features
- Hidden experiments enabled
- Debug modes configured for development
- CSS and rewrite caches flushed
- Elementor's library templates imported

## Manual Commands

If you prefer step-by-step control:

```bash
# 1. Prepare dependencies
npm run prepare-environment:ci

# 2. Build from current branch
npm run build:packages
npm run composer:no-dev
grunt scripts styles

# 3. Start WordPress environments
npm run start-local-server

# 4. Configure WordPress
npm run test:setup:playwright
```

## Docker Management

### Check Container Status
```bash
docker ps
```

### Stop Environment
```bash
docker stop $(docker ps -q)
```

### Remove Containers
```bash
docker rm $(docker ps -aq)
```

### Full Cleanup
```bash
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
```

## Environment Details

### Ports
- **8888**: Primary WordPress instance
- **8889**: Secondary WordPress instance (for testing)
- **Random MySQL ports**: Assigned by Docker

### File Structure
```
/build/               # Built Elementor plugin (from current branch)
/hello-elementor/     # Downloaded theme
/templates/           # Test templates
/test-results/        # Playwright test results
```

### WordPress Configuration
Environment settings are defined in:
- `tests/playwright/.playwright-wp-lite-env.json` - Playwright test environment
- `.wp-env.json` - Main wp-env configuration

Key settings:
- `ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS=true`
- `SCRIPT_DEBUG=false`
- `WP_DEBUG=false`

## Running Tests

### Playwright Tests
```bash
# Install Playwright (if not done already)
npx playwright install chromium

# Run all tests
npm run test:playwright

# Run with debug
npm run test:playwright:debug

# Run specific tests
npm run test:playwright -- --grep="@your-tag"
```

### Element Regression Tests
```bash
npm run test:playwright:elements-regression
```

## Troubleshooting

### Common Issues

**Docker containers won't start:**
```bash
# Clean up and restart
npm run env:setup
```

**WordPress shows database error:**
```bash
# Wait a moment for MySQL to initialize, then retry
sleep 10
npm run test:setup:playwright
```

**Elementor not activated:**
```bash
# Re-run WordPress setup
npm run test:setup:playwright
```

**Build fails on text domains:**
This is expected behavior. The script skips the full grunt build to avoid hello-elementor text domain warnings that would halt the process. Core Elementor functionality is still built correctly.

### Reset Everything
```bash
# Stop containers, remove everything, and start fresh
docker stop $(docker ps -q) && docker rm $(docker ps -aq)
npm run env:setup
```

### Dependencies Issues
```bash
# Clean reinstall
npm run reinstall
npm run env:setup
```

## Additional Resources

### Related Scripts
- `npm run start-local-server` - Start WordPress environments only
- `npm run test:setup:playwright` - Configure existing WordPress
- `npm run build` - Full build (may fail on text domains)
- `npm run build:packages` - Build core packages only

### Configuration Files
- `tests/playwright/.playwright-wp-lite-env.json` - WordPress environment config
- `tests/wp-env/config/setup.sh` - WordPress setup script
- `package.json` - NPM scripts and dependencies

## Development Workflow

1. **Switch to your feature branch**
   ```bash
   git checkout your-feature-branch
   ```

2. **Set up environment**
   ```bash
   npm run env:setup
   ```

3. **Make changes to Elementor code**

4. **Rebuild and test**
   ```bash
   npm run build
   # Test your changes at http://localhost:8888
   ```

5. **Run automated tests**
   ```bash
   npm run test:playwright
   npm run test:playwright test.test.ts
   ```

The environment uses your current branch code, so you can iterate quickly on development and testing.

## Performance Tips

- The script reuses Docker images when possible
- Build cache speeds up subsequent builds
- Use full `npm run build` to see changes in WordPress environment (`build:packages` only builds JS packages but doesn't update the `./build/` folder used by WordPress)
- Keep containers running between development sessions

## Security Notes

- This is a development environment only
- Default credentials are admin/password
- Containers are accessible on localhost only

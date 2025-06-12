# Elementor Testing Infrastructure Setup

This guide helps developers set up the testing environment for Elementor from scratch.

## 🚀 Quick Start (TL;DR)

```bash
# First time setup
npm run setup:testing

# Daily usage
npm run start-local-server          # Start environment
npm run test:elements-regression     # Run tests
npm run restart:clean               # Fix most issues
npm run troubleshoot                # Diagnose problems
```

## Prerequisites

- **Docker Desktop** installed and running
- **Node.js** (version 16 or higher)
- **npm** or **yarn**
- **macOS/Linux** (Windows with WSL2 should work but may need adjustments)

## Quick Setup (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Run the automated setup script
npm run setup:testing

# 3. Verify the setup
npm run test:setup:verify
```

## Manual Setup (Step by Step)

### 1. Environment Configuration

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` to match your local setup:
```env
USERNAME=admin
PASSWORD=password
BASE_URL=http://localhost:8888
ELEMENTS_REGRESSION_BASE_URL=http://localhost:8888
```

### 2. Start WordPress Environment

```bash
# Start the local WordPress servers
npm run start-local-server
```

This will:
- Start WordPress on ports 8888 and 8889
- Install WordPress with admin/password credentials
- Configure Elementor experiments and debug settings

### 3. Install Elementor Plugin

The setup script will automatically install Elementor, but if you need to do it manually:

```bash
# Install Elementor on both instances
docker exec port8888-cli-1 wp plugin install elementor --activate
docker exec port8889-cli-1 wp plugin install elementor --activate
```

### 4. Verify Setup

```bash
# Check that WordPress is accessible
curl -I http://localhost:8888
curl -I http://localhost:8889

# Check that Elementor is active
docker exec port8888-cli-1 wp plugin list | grep elementor
docker exec port8889-cli-1 wp plugin list | grep elementor
```

## Running Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run elements regression tests specifically
npm run test:elements-regression

# Run with specific test suite
TEST_SUITE=@nested-tabs npm run test:playwright
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "Failed to fetch Nonce" Error
**Symptoms**: Authentication errors in tests
**Solution**:
```bash
# Clear storage state files
rm -f test-results/.storageState-*.json

# Restart Docker environment
npm run restart:clean
```

#### 2. "Destination directory already exists" Error
**Symptoms**: Can't install Elementor plugin
**Solution**:
```bash
# Clean restart the environment
npm run restart:clean
```

#### 3. Docker Mount Issues
**Symptoms**: "Resource busy" or mount errors
**Solution**:
```bash
# Restart Docker Desktop completely
npm run restart:docker
```

#### 4. Port Already in Use
**Symptoms**: Can't start on ports 8888/8889
**Solution**:
```bash
# Check what's using the ports
lsof -i :8888
lsof -i :8889

# Kill processes if needed
npm run kill:ports
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USERNAME` | `admin` | WordPress admin username |
| `PASSWORD` | `password` | WordPress admin password |
| `BASE_URL` | `http://localhost:8888` | Primary WordPress URL |
| `ELEMENTS_REGRESSION_BASE_URL` | `http://localhost:8888` | URL for regression tests |
| `TEST_PARALLEL_INDEX` | `0` | Parallel test worker index |

### File Structure

```
elementor-base/
├── .env                          # Environment configuration
├── test-results/                 # Test outputs and storage states
├── tests/
│   ├── playwright/              # Playwright test configuration
│   └── elements-regression/     # Regression test suites
├── build/                       # Elementor build output (auto-generated)
└── templates/                   # Test templates (auto-generated)
```

## Development Workflow

### For Plugin Development
1. Make changes to Elementor source code
2. Run `npm run build` to compile changes
3. Restart WordPress containers: `npm run restart:containers`
4. Run tests: `npm run test:elements-regression`

### For Test Development
1. Write new tests in `tests/playwright/` or `tests/elements-regression/`
2. Run specific tests: `npx playwright test your-test.spec.ts`
3. Update snapshots if needed: `npx playwright test --update-snapshots`

## Performance Tips

- **Use parallel workers**: Tests run faster with multiple workers
- **Clean up regularly**: Run `npm run cleanup:docker` weekly
- **Monitor resources**: Docker can consume significant CPU/memory
- **Use test filters**: Run only the tests you need during development

## Getting Help

If you encounter issues not covered here:

1. Check the [Playwright documentation](https://playwright.dev/)
2. Review recent changes in the project
3. Ask in the team chat with error details
4. Create an issue with reproduction steps

## Maintenance

### Weekly Cleanup
```bash
# Clean up Docker resources
npm run cleanup:docker

# Update dependencies
npm update
```

### Monthly Updates
```bash
# Update Playwright browsers
npx playwright install

# Check for WordPress/Elementor updates
npm run check:updates
``` 
# Running tests
To run the tests, we have 3 steps:
1. Run a local WordPress server
2. Set up the WordPress server
3. Run tests

## Running the local WordPress server
In order to get a stable, reproducible test environment, we decided to use [wp-env](https://www.npmjs.com/package/@wordpress/env) which provides us with a Dockerized server and WP CLI.
To run the server, run the following command:
`npm run start-local-server`
This command runs a WordPress server (using wp-env).

## Configuring the server
Our tests require the following configuration:
1. Import templates - for now, only the law-firm-about template is required
2. .htaccess configuration
3. Theme
To configure the server, run the following command:
`npm run test:setup:playwright-sanity`
This command imports the templates, rewrites .htaccess rules and activates the `hello-elementor` theme

## Running tests
We have several test packages that can be run separately. The separation has been done in order to parallelize the CI test runs.
To run the tests, run the following command:
`npm run test:playwright`
This command runs the "default" test package.
If you want to run a different package: `npm run test:playwright -- --grep="@nested-tabs"` or
`TEST_SUITE=@nested-tabs npm run test:playwright`

## Code Coverage
The Playwright tests automatically collect JavaScript/TypeScript code coverage during test execution.

### How it works
- Coverage is collected automatically for all tests using the Chrome DevTools Protocol
- Each test uses a coverage fixture (`fixtures/coverage.ts`) that wraps the test execution
- Raw coverage data is saved to `.nyc_output/` directory (one file per test)
- After all tests complete, coverage reports are generated automatically via global teardown

### Viewing coverage reports
After running tests with `npm run test:playwright`, coverage reports will be available at:
- **HTML Report**: `coverage/index.html` - Open in browser for detailed, interactive coverage report
- **LCOV Report**: `coverage/lcov.info` - For CI integration and tools like CodeCov
- **Console Summary**: Coverage percentages are printed to console after tests complete

### What's included
Coverage tracks all JavaScript/TypeScript code executed in the browser during tests:
- Main plugin JS/TS: `assets/`, `app/`, `modules/`
- Packages: `packages/` directory (bundled code)
- Only project files are included (excludes node_modules, test files)

### Implementation details
- **Global Setup** (`global-setup.ts`): Cleans `.nyc_output/` and `coverage/` directories before tests
- **Coverage Fixture** (`fixtures/coverage.ts`): Extends `parallelTest` with automatic coverage collection
- **Global Teardown** (`global-teardown.ts`): Merges coverage data and generates reports
- **Report Generator** (`utils/generate-coverage-report.ts`): Uses Istanbul libraries to process V8 coverage

### Notes
- Coverage directories (`.nyc_output/`, `coverage/`) are automatically cleaned before each test run
- Coverage data is merged from all tests to provide a complete picture
- E2E test coverage typically focuses on user workflows, so percentages may be lower than unit test coverage
- All test files have been updated to use the coverage fixture

## Troubleshooting Guide
Problem: When running any test locally when we update config to a local site from localhost8888.

'Error: Failed to fetch Nonce. Base URL: http://local-dev.local/, Storage State: /Users/user/Local Sites/local-dev/app/public/wp-content/plugins/elementor/test-results/.storageState-0.json'

Solution: If you were authenticated on localhost and then changed the base URL, the existing storageState will be used inside parallelTest, which can cause issues. Deleting the test-results/.storageState-{id}.json file should help resolve this.

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

## Troubleshooting Guide
Problem: When running any test locally when we update config to a local site from localhost8888.

‘Error: Failed to fetch Nonce. Base URL: http://local-dev.local/, Storage State: /Users/user/Local Sites/local-dev/app/public/wp-content/plugins/elementor/test-results/.storageState-0.json’

Solution: If you were authenticated on localhost and then changed the base URL, the existing storageState will be used inside parallelTest, which can cause issues. Deleting the test-results/.storageState-{id}.json file should help resolve this.

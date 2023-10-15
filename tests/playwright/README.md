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
If you want to run a different package, add `:<test package>` to the command, e.g. `npm run test:playwright:nested-tabs`

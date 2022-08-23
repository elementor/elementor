const { devices } = require( '@playwright/test' );
const dotenv = require( 'dotenv' );
const path = require( 'path' );

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config( {
	path: path.resolve( __dirname, './.env' ),
} );

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * @type import('@playwright/test').PlaywrightTestConfig
 */
const config = {
	testDir: './tests/',
	/* Maximum time one test can run for. */
	timeout: 30 * 1000,
	globalSetup: path.resolve( __dirname, './global-setup.js' ),
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 5000,
	},
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !! process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI. */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: 'list',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 0,
		/* Base URL to use in actions like `await page.goto('/')`. */
		// baseURL: 'http://localhost:3000',

		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		// StorageState: require.resolve( './storageState.json' ),
		baseURL: process.env.BASE_URL,
		user: {
			username: process.env.WP_USERNAME || 'admin',
			password: process.env.WP_PASSWORD || 'password',
		},
		storageState: path.resolve( __dirname, '.storageState.json' ),
	},
	webServer: {
		url: process.env.BASE_URL,
		timeout: 120 * 1000,
		reuseExistingServer: ! process.env.CI,
	},
	/* Configure projects for major browsers */
	projects: [
		{
			name: 'chromium',
			use: {
				...devices[ 'Desktop Chrome' ],
				viewport: { width: 1920, height: 1080 },
			},
		},
		// {
		//   name: 'firefox',
		//   use: {
		//     ...devices[ 'Desktop Firefox' ],
		//   },
		// },
		//
		// {
		//   name: 'webkit',
		//   use: {
		//     ...devices[ 'Desktop Safari' ],
		//   },
		// },
	],
	/* Folder for test artifacts such as screenshots, videos, traces, etc. */
	// outputDir: 'test-results/',
};

module.exports = config;

// @ts-check
const dotenv = require( 'dotenv' );
const path = require( 'path' );

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
dotenv.config( {
	path: path.resolve( __dirname, './.env' ),
} );

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	testDir: './tests/',
	/* Maximum time one test can run for. */
	timeout: 2 * 60 * 1000, // 2 minutes
	globalSetup: path.resolve( __dirname, './src/global-setup.js' ),
	expect: {
		/**
		 * Maximum time expect() should wait for the condition to be met.
		 * For example in `await expect(locator).toHaveText();`
		 */
		timeout: 5 * 1000, // 5 seconds
	},
	/* Fail the build on CI if you accidentally left test.only in the source code. */
	forbidOnly: !! process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 1 : 0,
	/* Retry on CI only */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use. See https://playwright.dev/docs/test-reporters */
	reporter: process.env.CI ? 'github' : 'list',
	/* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
	use: {
		/* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
		actionTimeout: 0,
		/* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
		trace: 'on-first-retry',
		video: process.env.ELEMENTS_REGRESSION_VIDEO || ( process.env.CI ? 'on-first-retry' : 'off' ),
		viewport: { width: 1920, height: 1080 },
		baseURL: process.env.ELEMENTS_REGRESSION_BASE_URL || 'http://localhost:8889',
		storageState: path.resolve( __dirname, 'storage-state.json' ),
		validateAllPreviousCasesChecked: process.env.ELEMENTS_REGRESSION_VALIDATE_ALL_PREVIOUS_TEST_CASES || ( process.env.CI ? 'on' : 'off' ),
		user: {
			username: process.env.ELEMENTS_REGRESSION_WP_USERNAME || 'admin',
			password: process.env.ELEMENTS_REGRESSION_WP_PASSWORD || 'password',
		},
	},
};

module.exports = config;

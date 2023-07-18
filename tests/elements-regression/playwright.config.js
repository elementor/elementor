import { config as _config } from 'dotenv';
import { resolve } from 'path';

_config( {
	path: resolve( __dirname, './.env' ),
} );

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
	testDir: './tests/',

	timeout: 3 * 60 * 1000,
	globalSetup: resolve( __dirname, '../playwright/config/global-setup.js' ),
	expect: {
		timeout: 5000,
	},

	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 3 : 1,
	fullyParallel: true,
	reporter: process.env.CI ? 'github' : 'list',
	use: {
		headless: true,
		actionTimeout: 8000,
		navigationTimeout: 8000,
		trace: 'on-first-retry',
		video: process.env.CI ? 'retain-on-failure' : 'off',
		viewport: { width: 1920, height: 1080 },
		baseURL: process.env.ELEMENTS_REGRESSION_BASE_URL || 'http://localhost:8888',
		storageState: resolve( __dirname, 'storageState.json' ),
		user: {
			username: process.env.ELEMENTS_REGRESSION_WP_USERNAME || 'admin',
			password: process.env.ELEMENTS_REGRESSION_WP_PASSWORD || 'password',
		},
	},
};

import { config as _config } from 'dotenv';
import { resolve } from 'path';

_config( {
	path: resolve( __dirname, './.env' ),
} );

/** @type {import('@playwright/test').PlaywrightTestConfig} */
export default {
	testDir: './tests/',

	timeout: 3 * 60_000,
	globalSetup: resolve( __dirname, '../playwright/global-setup.ts' ),
	expect: {
		timeout: 8_000,
	},
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 3 : 5,
	fullyParallel: true,
	reporter: process.env.CI ? [ [ 'github' ], [ 'list' ] ] : 'list',
	use: {
		headless: process.env.CI ? true : false,
		actionTimeout: 8_000,
		navigationTimeout: 8_000,
		trace: 'retain-on-failure',
		video: process.env.CI ? 'retain-on-failure' : 'off',
		viewport: { width: 1920, height: 1080 },
		baseURL: process.env.ELEMENTS_REGRESSION_BASE_URL || 'http://localhost:8888',
		storageState: './storageState.json',
		user: {
			username: process.env.ELEMENTS_REGRESSION_WP_USERNAME || 'admin',
			password: process.env.ELEMENTS_REGRESSION_WP_PASSWORD || 'password',
		},
	},
};

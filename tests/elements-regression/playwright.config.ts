import { config as _config } from 'dotenv';
import { resolve } from 'path';
import { defineConfig } from '@playwright/test';

_config( {
	path: resolve( __dirname, './.env' ),
} );

export default defineConfig( {
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
		baseURL: process.env.BASE_URL || ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? 'http://localhost:8889' : 'http://localhost:8888',
		// storageState: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
	},
} );

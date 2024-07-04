import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as _config } from 'dotenv';

process.env.DEV_SERVER = 'http://localhost:8888';
process.env.TEST_SERVER = 'http://localhost:8888'; // Test server is the same as dev server in elements-regression
process.env.DEBUG_PORT = 1 === Number( process.env.TEST_PARALLEL_INDEX ) ? '9223' : '9222';

_config( {
	path: resolve( __dirname, './.env' ),
} );

export default defineConfig( {
	testDir: './tests/',
	globalSetup: resolve( __dirname, 'global-setup.ts' ),
	timeout: 90_000,
	globalTimeout: 60 * 15_000,
	expect: {
		timeout: 5_000,
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
		toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
	},
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 3 : 5,
	fullyParallel: true,
	reporter: process.env.CI ? [ [ 'github' ], [ 'list' ] ] : 'list',
	use: {
		launchOptions: {
			args: [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
		},
		headless: !! process.env.CI,
		ignoreHTTPSErrors: true,
		actionTimeout: 10_000,
		navigationTimeout: 10_000,
		trace: 'retain-on-failure',
		video: process.env.CI ? 'retain-on-failure' : 'off',
		baseURL: process.env.BASE_URL || process.env.DEV_SERVER,
		viewport: { width: 1920, height: 1080 },
		storageState: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
	},
} );

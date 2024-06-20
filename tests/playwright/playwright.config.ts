import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as _config } from 'dotenv';

process.env.DEBUG_PORT = '9222';

_config( {
	path: resolve( __dirname, './.env' ),
} );

export default defineConfig( {
	testDir: './sanity',
	timeout: 90_000,
	globalTimeout: 60 * 15_000,
	globalSetup: resolve( __dirname, './global-setup.ts' ),
	grepInvert: /elements-regression/,
	expect: {
		timeout: 5_000,
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
		toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
	},
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: process.env.CI ? 1 : 1,
	fullyParallel: false,
	reporter: process.env.CI ? [ [ 'github' ], [ 'list' ] ] : 'list',
	use: {
		launchOptions: {
			args: [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
		},
		headless: process.env.CI ? true : false,
		ignoreHTTPSErrors: true,
		actionTimeout: 10_000,
		navigationTimeout: 10_000,
		trace: 'retain-on-failure',
		video: process.env.CI ? 'retain-on-failure' : 'off',
		baseURL: process.env.BASE_URL || 'http://localhost:8888',
		viewport: { width: 1920, height: 1080 },
		storageState: './storageState.json',
	},
} );

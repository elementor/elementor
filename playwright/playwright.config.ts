import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as _config } from 'dotenv';

process.env.DEV_SERVER = 'http://127.0.0.1:9400';
process.env.DEBUG_PORT = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '9223' : '9222';

_config( {
	path: resolve( __dirname, '../.env' ),
} );

export default defineConfig( {
	testDir: '../',
	testMatch: [ '**/e2e/*.e2e.ts' ],
	expect: {
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
		toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
	},
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 2 : 0,
	workers: process.env.CI ? 2 : 1,
	fullyParallel: false,
	reporter: process.env.CI
		? [ [ 'github' ], [ 'list' ] ]
		: [ [ 'list' ] ],
	use: {
		baseURL: process.env.DEV_SERVER,
		launchOptions: {
			args: [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
		},
		headless: true,
		ignoreHTTPSErrors: true,
		trace: process.env.CI ? 'retain-on-failure' : 'on',
		video: process.env.CI ? 'retain-on-failure' : 'on',
		viewport: { width: 1920, height: 1080 },
		actionTimeout: 3000,
	},
} );

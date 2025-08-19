import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as _config } from 'dotenv';
import { timeouts } from './config/timeouts';

process.env.DEV_SERVER = 'http://localhost:8888';
process.env.TEST_SERVER = 'http://localhost:8889';
process.env.DEBUG_PORT = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '9223' : '9222';

_config( {
	path: resolve( __dirname, '../../.env' ),
} );

export default defineConfig( {
	testDir: './sanity',
	timeout: timeouts.singleTest,
	globalTimeout: timeouts.global,
	grepInvert: /elements-regression/,
	expect: {
		timeout: timeouts.expect,
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
		toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
	},
	forbidOnly: !! process.env.CI,
	retries: process.env.CI ? 9 : 0,
	workers: process.env.CI ? 2 : 1,
	fullyParallel: false,
	reporter: process.env.CI
		? [ [ 'github' ], [ 'list' ] ]
		: [ [ 'list' ] ],
	use: {
		launchOptions: {
			args: [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
		},
		headless: !! process.env.CI,
		ignoreHTTPSErrors: true,
		actionTimeout: timeouts.action,
		navigationTimeout: timeouts.navigation,
		trace: 'retain-on-failure',
		video: process.env.CI ? 'retain-on-failure' : 'off',
		baseURL: process.env.BASE_URL ||
			( ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) )
				? process.env.TEST_SERVER
				: process.env.DEV_SERVER ),
		viewport: { width: 1920, height: 1080 },
		storageState: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
	},
} );

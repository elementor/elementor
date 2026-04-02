import { resolve } from 'path';
import { type PlaywrightTestConfig, defineConfig, devices } from '@playwright/test';
import { config as _config } from 'dotenv';
import { timeouts as timeoutsConfig } from './config/timeouts';

const isCI = Boolean( process.env.CI );
const localDevServer = 'http://127.0.0.1:9400';
const localTestServer = 'http://127.0.0.1:9400';
const ciDevServer = 'http://localhost:8888';
const ciTestServer = 'http://localhost:8889';

process.env.DEV_SERVER = isCI ? ciDevServer : localDevServer;
process.env.TEST_SERVER = isCI ? ciTestServer : localTestServer;

process.env.DEBUG_PORT = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '9223' : '9222';
const timeouts = isCI ? timeoutsConfig : Object.entries( timeoutsConfig ).reduce( ( acc, [ key, value ] ) => {
	acc[ key ] = value * 2;
	return acc;
}, {} as typeof timeoutsConfig );

_config( {
	path: resolve( __dirname, '../../.env' ),
} );

const browserConfigs: Record<string, PlaywrightTestConfig[ 'projects' ][ number ]> = {
	chromium: {
		name: 'chromium',
		snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}{-snapshotSuffix}{ext}',
		use: {
			...devices[ 'Desktop Chrome' ],
			launchOptions: {
				args: [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
			},
		},
	},
	firefox: {
		name: 'firefox',
		use: {
			...devices[ 'Desktop Firefox' ],
			viewport: { width: 1920, height: 1080 },
		},
	},
	webkit: {
		name: 'webkit',
		use: {
			...devices[ 'Desktop Safari' ],
			viewport: { width: 1920, height: 1080 },
		},
	},
};

const requestedBrowsers = ( process.env.BROWSERS || 'chromium' ).split( /\s+/ ).filter( Boolean );
const projects = requestedBrowsers
	.map( ( browser ) => browserConfigs[ browser ] )
	.filter( Boolean );

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
	retries: process.env.CI ? 3 : 0,
	workers: process.env.CI ? 2 : 1,
	fullyParallel: false,
	reporter: process.env.CI
		? [ [ 'github' ], [ 'list' ], [ 'allure-playwright', { suiteTitle: false } ] ]
		: [ [ 'list' ] ],
	projects,
	use: {
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

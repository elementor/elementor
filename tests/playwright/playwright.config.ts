import { defineConfig } from '@playwright/test';
import { config, cfHeaders } from './config/env';
import { timeouts as timeoutsConfig } from './config/timeouts';

const fullBrowserCompat = 'true' === process.env.FULL_BROWSER_COMPAT;

// Expose resolved URLs to parallelTest.ts worker fixtures via process.env
process.env.DEV_SERVER = config.wp.baseURL;
process.env.TEST_SERVER = config.wp.testServerURL;

process.env.DEBUG_PORT = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '9223' : '9222';

const timeouts = config.isCI
	? timeoutsConfig
	: Object.entries( timeoutsConfig ).reduce( ( acc, [ key, value ] ) => {
		acc[ key ] = value * 2;
		return acc;
	}, {} as typeof timeoutsConfig );

export default defineConfig( {
	testDir: './sanity',
	globalSetup: './global-setup',
	globalTeardown: './global-teardown',
	snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{platform}{ext}',
	timeout: timeouts.singleTest,
	globalTimeout: timeouts.global,
	grepInvert: /elements-regression/,
	expect: {
		timeout: timeouts.expect,
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
		toHaveScreenshot: { maxDiffPixelRatio: 0.03 },
	},
	forbidOnly: !! config.isCI,
	retries: config.isCI ? 3 : 0,
	workers: config.isCI ? 2 : 1,
	fullyParallel: false,
	reporter: config.isCI
		? [ [ 'github' ], [ 'list' ], [ 'allure-playwright', { suiteTitle: false } ] ]
		: [ [ 'list' ] ],
	use: {
		launchOptions: {
			args: fullBrowserCompat ? [] : [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
		},
		headless: true,
		ignoreHTTPSErrors: true,
		actionTimeout: timeouts.action,
		navigationTimeout: timeouts.navigation,
		trace: 'retain-on-failure',
		video: config.isCI ? 'retain-on-failure' : 'off',
		baseURL: config.wp.baseURL,
		viewport: { width: 1920, height: 1080 },
		storageState: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
		// Inject CF Access headers for all browser requests when ENV=stg/prod
		extraHTTPHeaders: cfHeaders,
	},
	...( fullBrowserCompat ? {
		projects: [
			{
				name: 'chromium',
				use: { browserName: 'chromium' },
			},
			{
				name: 'firefox',
				use: { browserName: 'firefox' },
				snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-firefox-{platform}{ext}',
			},
			{
				name: 'webkit',
				use: { browserName: 'webkit' },
				snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-webkit-{platform}{ext}',
			},
		],
	} : {} ),
} );

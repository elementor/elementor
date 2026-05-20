import { resolve } from 'path';
import { defineConfig, devices } from '@playwright/test';
import { config as _config } from 'dotenv';
import { isOktaAuthEnabled, STORAGE_STATE } from './config/auth';
import { timeouts as timeoutsConfig } from './config/timeouts';

_config( {
	path: resolve( __dirname, '../../.env' ),
} );

const isCI = Boolean( process.env.CI );
const fullBrowserCompat = 'true' === process.env.FULL_BROWSER_COMPAT;
const oktaAuthEnabled = isOktaAuthEnabled();
const localDevServer = 'https://my.elementor.com';
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

const sharedUse = {
	launchOptions: {
		args: fullBrowserCompat ? [] : [ `--remote-debugging-port=${ process.env.DEBUG_PORT }` ],
	},
	headless: false,
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
	storageState: oktaAuthEnabled
		? STORAGE_STATE
		: `./storageState-${ process.env.TEST_PARALLEL_INDEX }.json`,
};

const setupProject = {
	name: 'setup',
	testDir: __dirname,
	testMatch: /auth\.setup\.ts/,
	use: {
		...sharedUse,
		storageState: { cookies: [], origins: [] },
	},
};

function buildTestProjects() {
	const testProjectDefaults = {
		testDir: './sanity',
		grepInvert: /elements-regression/,
		dependencies: [ 'setup' ],
		use: sharedUse,
	};

	if ( fullBrowserCompat ) {
		return [
			{
				...testProjectDefaults,
				name: 'chromium',
				use: { ...devices[ 'Desktop Chrome' ], ...sharedUse },
			},
			{
				...testProjectDefaults,
				name: 'firefox',
				use: { ...devices[ 'Desktop Firefox' ], ...sharedUse },
				snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-firefox-{platform}{ext}',
			},
			{
				...testProjectDefaults,
				name: 'webkit',
				use: { ...devices[ 'Desktop Safari' ], ...sharedUse },
				snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-webkit-{platform}{ext}',
			},
		];
	}

	return [
		{
			...testProjectDefaults,
			name: 'chromium',
			use: { ...devices[ 'Desktop Chrome' ], ...sharedUse },
		},
	];
}

function buildBrowserCompatProjects() {
	return [
		{
			name: 'chromium',
			use: { browserName: 'chromium' as const },
		},
		{
			name: 'firefox',
			use: { browserName: 'firefox' as const },
			snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-firefox-{platform}{ext}',
		},
		{
			name: 'webkit',
			use: { browserName: 'webkit' as const },
			snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-webkit-{platform}{ext}',
		},
	];
}

function getOptionalProjects() {
	if ( oktaAuthEnabled ) {
		return { projects: [ setupProject, ...buildTestProjects() ] };
	}

	if ( fullBrowserCompat ) {
		return { projects: buildBrowserCompatProjects() };
	}

	return {};
}

export default defineConfig( {
	...( oktaAuthEnabled ? {} : { testDir: './sanity' } ),
	snapshotPathTemplate: '{snapshotDir}/{testFileDir}/{testFileName}-snapshots/{arg}-{platform}{ext}',
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
	use: sharedUse,
	...getOptionalProjects(),
} );

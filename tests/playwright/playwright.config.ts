import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as _config } from 'dotenv';

process.env.DEBUG_PORT = '9222';

function getGrepInvert() {
	if ( '@default' === process.env.TEST_SUITE ) {
		return [
			/@reverse-columns/,
			/@nested-tabs/,
			/@container/,
			/@nested-accordion/,
			/@styleguide_image_link/,
			/@elements-regression/,
			/@ai/,
			/@onBoarding/,
			/@video/,
			/@rating/,
			/@pluginTester1_containers/,
			/@pluginTester2_containers/,
			/@pluginTester1_sections/,
			/@pluginTester2_sections/,
			/@promotions/,
			/@nested-atomic-repeaters/,
		];
	}
	return [];
}

_config( {
	path: resolve( __dirname, './.env' ),
} );

function getGrep() {
	if ( undefined === process.env.TEST_SUITE || '@default' === process.env.TEST_SUITE ) {
		return [ /.*/ ];
	} else if ( 'default' !== process.env.TEST_SUITE ) {
		return [ new RegExp( `${ process.env.TEST_SUITE }` ) ];
	}
	return [ /.*/ ];
}

export default defineConfig( {
	testDir: './sanity',
	timeout: 90_000,
	globalTimeout: 60 * 15_000,
	globalSetup: resolve( __dirname, './global-setup.ts' ),
	grepInvert: getGrepInvert(),
	grep: getGrep(),
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

// @ts-check

function getGrepInvert() {
	if ( '@default' === process.env.TEST_SUITE ) {
		return [ /@reverse-columns/, /@nested-tabs/ ];
	}
	return [];
}

function getGrep() {
	if ( undefined === process.env.TEST_SUITE || '@default' === process.env.TEST_SUITE ) {
		return [ /.*/ ];
	} else if ( 'default' !== process.env.TEST_SUITE ) {
		return [ new RegExp( `${ process.env.TEST_SUITE }` ) ];
	}
	return [ /.*/ ];
}

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	timeout: 90_000, // 90 seconds
	globalTimeout: 60 * 15_000, // 15 minutes
	reporter: 'list',
	testDir: '../sanity/',
	grepInvert: getGrepInvert(),
	grep: getGrep(),
	globalSetup: require.resolve( './global-setup' ),
	retries: 1,
	forbidOnly: !! process.env.CI,
	expect: {
		timeout: 5_000, // 5 seconds
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
	},
	use: {
		actionTimeout: 10_000, // 10 seconds
		navigationTimeout: 10_000, // 10 seconds
		headless: true,
		storageState: './tests/playwright/config/storageState.json',
		baseURL: process.env.BASE_URL || 'http://localhost:8888',
		viewport: { width: 1920, height: 1080 },
		video: 'on',
		trace: 'retain-on-failure',
		user: {
			username: process.env.USERNAME || 'admin',
			password: process.env.PASSWORD || 'password',
		},
		baseURLPrefixProxy: process.env.BASE_URL_PROXY_PREFIX || false,
	},
	workers: 1,
};

module.exports = config;

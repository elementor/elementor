// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	timeout: 90 * 1000, // 90 seconds
	globalTimeout: 60 * 15 * 1000, // 15 minutes
	reporter: 'list',
	testDir: '../sanity/',
	globalSetup: require.resolve( './global-setup' ),
	retries: 1,
	expect: {
		timeout: 5 * 1000, // 5 seconds
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
	},
	use: {
		actionTimeout: 10 * 1000, // 4 seconds
		navigationTimeout: 10 * 1000, // 10 seconds
		headless: true,
		storageState: './tests/playwright/config/storageState.json',
		baseURL: process.env.BASE_URL || 'http://localhost:8888',
		viewport: { width: 1920, height: 1080 },
		video: 'on',
		trace: 'on-first-retry',
		user: {
			username: process.env.USERNAME || 'admin',
			password: process.env.PASSWORD || 'password',
		},
		baseURLPrefixProxy: process.env.BASE_URL_PROXY_PREFIX || false,
	},
	workers: 1,
};

module.exports = config;

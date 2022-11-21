// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	timeout: 90_000, // 90 seconds
	globalTimeout: 60 * 15_000, // 15 minutes
	reporter: 'list',
	testDir: '../sanity/',
	globalSetup: require.resolve( './global-setup' ),
	retries: 1,
	expect: {
		timeout: 20_000, // 20 seconds
		toMatchSnapshot: { maxDiffPixelRatio: 0.03 },
	},
	use: {
		actionTimeout: 20_000, // 20 seconds
		navigationTimeout: 20_000, // 20 seconds
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

// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	timeout: 900000,
	globalTimeout: 900000,
	reporter: process.env.CI ? 'github' : 'list',
	testDir: './tests/',
	globalSetup: require.resolve( './global-setup' ),
	retries: 1,
	use: {
		headless: true,
		storageState: './tests/elements-regression/storage-state.json',
		elementsConfig: './tests/elements-regression/elements-config.json',
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

// playwright.config.js
// @ts-check

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	timeout: 40000,
	globalTimeout: 900000,
	reporter: 'list',
	testDir: '../sanity/',
	testMatch: [
		'modules/*test.*js',
		'*test.*js',
	],
	globalSetup: require.resolve( './global-setup' ),
	retries: 1,
	use: {
		headless: true,
		storageStatePath: './storageState.json',
		storageState: './storageState.json', // Save the login state, reduce the requirements to login after 'globalSetup' runs.
		baseURL: process.env.baseURL || 'http://localhost:8888',
		viewport: { width: 1440, height: 960 },
		video: 'on-first-retry',
		user: {
			username: 'admin',
			password: 'password',
		},
	},
};

module.exports = config;

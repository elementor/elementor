// @ts-check
const base = require( './sanity.config.js' );

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
	...base,
	retries: 0,
	workers: 1,
	use: {
		...base.use,
		headless: false,
		baseURL: 'http://localhost:8889/',
		video: 'off',
	},
};

module.exports = config;

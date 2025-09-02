import { resolve } from 'path';
import { defineConfig } from '@playwright/test';
import { config as _config } from 'dotenv';
import { basicPlaywrightConfig } from '../tests/playwright/playwright.config';

process.env.DEV_SERVER = 'http://127.0.0.1:9400';
process.env.DEBUG_PORT = ( 1 === Number( process.env.TEST_PARALLEL_INDEX ) ) ? '9223' : '9222';

_config( {
	path: resolve( __dirname, '../.env' ),
} );

export default defineConfig( {
	testDir: '../e2e',
	testMatch: [ '*.e2e.ts' ],
	...basicPlaywrightConfig,
	use: {
		...basicPlaywrightConfig.use,
		headless: true,
	},
} );

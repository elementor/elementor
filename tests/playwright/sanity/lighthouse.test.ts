import { playAudit } from 'playwright-lighthouse';
import { test } from '@playwright/test';
import config from 'lighthouse/lighthouse-core/config/desktop-config';

test.describe( 'audit example', () => {
	test( 'open browser', async ( { page } ) => {
		await page.goto( 'http://localhost:8888/law-firm-about/' );
		await playAudit( {
			page,
			config,
			thresholds: {
				performance: 50,
				accessibility: 50,
				'best-practices': 50,
				seo: 50,
			},
			port: 9222,
		} );
	} );
} );

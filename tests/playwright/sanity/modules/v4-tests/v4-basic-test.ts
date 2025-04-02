import { test, expect } from '@playwright/test';

test( 'Failing test', async ( { page } ) => {
	await page.goto( 'https://example.com' );
	await expect( page.locator( 'h1' ) ).toHaveText( 'This will fail' );
} );

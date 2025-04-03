import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';

test( 'Failing test @v4-tests', async ( { page } ) => {
	await page.goto( 'https://example.com' );
	await expect( page.locator( 'h1' ) ).toHaveText( 'This will fail' );
} );

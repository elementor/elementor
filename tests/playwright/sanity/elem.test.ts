import test, { expect } from '@playwright/test';

test( 'my.elementor.com dashboard shows Sites', async ( { page } ) => {
	await page.goto( '/websites' );

	await expect( page ).toHaveURL( /\/websites/ );
	await expect( page.getByText( 'Sites', { exact: true } ).first() ).toBeVisible();
} );

import { parallelTest as test } from '../../../parallelTest';
import { expect } from '@playwright/test';

test.describe( 'Home screen tests', () => {
	test( `'Create a new page' button opens the editor in a new page`, async ( { page } ) => {
		await page.goto( 'wp-admin/admin.php?page=elementor' );

		const createNewPageButton = page.getByRole( 'link', { name: 'Create a Page' } );

		await expect( createNewPageButton ).toHaveAttribute( 'href', /wp-admin\/edit\.php\?action=elementor_new_post&post_type=page&_wpnonce=.*/ );

		await createNewPageButton.click();

		const [ newPage ] = await Promise.all( [
			page.waitForEvent( 'popup' ),
		] );

		await newPage.waitForURL( /wp-admin\/post\.php\?post=\d+&action=elementor/ );

		await expect( newPage.locator( 'body' ) ).toHaveClass( /.*elementor-editor-active.*/ );
	} );
} );

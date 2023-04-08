const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );

test.describe( 'Section tests', () => {
	test( 'Verify Elementor New Page Button', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
        await wpAdmin.goto( '/wp-admin/edit.php?post_type=page' );

        const button = page.locator( '#e-new-page' );
        await button.click();

        const redirected = await page.waitForURL( /post.php\?action=elementor&post=\d+/ );
        expect( redirected ).toBeTruthy();
	} );
} );

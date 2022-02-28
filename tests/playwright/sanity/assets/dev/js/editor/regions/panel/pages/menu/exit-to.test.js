const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../../../../../../pages/wp-admin-page' );

test( 'Exit to user preference sanity test', async ( { page }, testInfo ) => {
    // Arrange.
    const wpAdmin = new WpAdminPage( page, testInfo ),
        editor = await wpAdmin.openNewPage();

    await editor.page.click( '#elementor-panel-header-menu-button' );

    const exit = await page.locator( '.elementor-panel-menu-item-exit' );

    // Select dashboard
    setExitUserPreference( page, 'dashboard' );

    await expect( exit ).toContainText( 'Exit To WP Dashboard' );

    // // Select wp_post_type
    setExitUserPreference( page, 'wp_post_type' );

    await expect( exit ).toContainText( 'Exit To WP Page' );
} );

const setExitUserPreference = async ( page, option ) => {
    await page.click( '.elementor-panel-menu-item-editor-preferences' );
    await page.selectOption( '.elementor-control-exit_to >> select', option );
    await page.click( '#elementor-panel-header-menu-button' );
};

const { test, expect } = require( '@playwright/test' );
const { EditorPage } = require( '../../../../../../../../../pages/editor-page' );
const { WpAdminPage } = require( '../../../../../../../../../pages/wp-admin-page' );

test( 'Exit to sanity test', async ( { page } ) => {
    const wpAdmin = new WpAdminPage( page );
    await wpAdmin.createNewPage();

    this.editor = new EditorPage( page );
    await this.editor.page.click( '#elementor-panel-header-menu-button' );

    const exit = await page.locator( '.elementor-panel-menu-item-exit-to-dashboard > a' );

    // Select dashboard
    setExitUserPreference( 'dashboard' );

    await expect( exit ).toContainText( 'Exit to WP Dashboard' );

    // // Select wp_post_type
    setExitUserPreference( 'wp_post_type' );

    await expect( exit ).toContainText( 'Exit to WP Page' );
} );

const setExitUserPreference = async ( option ) => {
    await this.editor.page.click( '.elementor-panel-menu-item-editor-preferences' );
    await this.editor.page.selectOption('.elementor-control-exit_to >> select', option);
    await this.editor.page.click( '#elementor-panel-header-menu-button' );
}

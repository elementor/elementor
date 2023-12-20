import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../../../../../pages/wp-admin-page';
import EditorPage from '../../../../../../../../../pages/editor-page';

test( 'Exit to user preference sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.openNewPage();

	await editor.page.click( '#elementor-panel-header-menu-button' );

	await editor.page.click( '.elementor-panel-menu-item-editor-preferences' );

	await editor.page.click( '#elementor-panel-header-menu-button' );

	const exit = page.locator( '.elementor-panel-menu-item-exit a' );
	let exitHref = '';

	// Select dashboard
	await setExitUserPreference( editor, 'dashboard' );

	exitHref = await exit.evaluate( ( element ) => element.getAttribute( 'href' ) );

	expect( exitHref ).toContain( '/wp-admin/' );

	// Select wp_post_type
	await setExitUserPreference( editor, 'this_post' );

	exitHref = await exit.getAttribute( 'href' );

	expect( exitHref ).toContain( '/wp-admin/post.php?post=' );

	// Select all_posts
	await setExitUserPreference( editor, 'all_posts' );

	exitHref = await exit.getAttribute( 'href' );

	expect( exitHref ).toContain( '/wp-admin/edit.php' );
} );

const setExitUserPreference = async ( editor: EditorPage, option: string ) => {
	await editor.page.click( '.elementor-panel-menu-item-editor-preferences' );
	await editor.page.selectOption( '.elementor-control-exit_to >> select', option );
	await editor.page.click( '#elementor-panel-header-menu-button' );
	await editor.getPreviewFrame().locator( '#elementor-add-new-section' ).click( { button: 'right' } );
	await editor.page.click( '#elementor-panel-header-menu-button' );
};

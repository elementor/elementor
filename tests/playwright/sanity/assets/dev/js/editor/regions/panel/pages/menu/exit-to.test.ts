import { test, expect, type Page } from '@playwright/test';
import WpAdminPage from '../../../../../../../../../pages/wp-admin-page';

test( 'Exit to user preference sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.openNewPage();

	await editor.page.click( '#elementor-panel-header-menu-button' );

	// Trigger dialog by click on the "Exit" button
	await editor.page.click( 'text=Exit' );
	await editor.page.click( 'a:has-text("User Preferences")' );

	await editor.page.click( '#elementor-panel-header-menu-button' );

	const exit = page.locator( '.elementor-panel-menu-item-exit >> a' );
	let exitHref = '';

	// Select dashboard
	await setExitUserPreference( page, 'dashboard' );

	exitHref = await exit.getAttribute( 'href' );

	expect( exitHref ).toContain( '/wp-admin/' );

	// Select wp_post_type
	await setExitUserPreference( page, 'this_post' );

	exitHref = await exit.getAttribute( 'href' );

	expect( exitHref ).toContain( '/wp-admin/post.php?post=' );

	// Select all_posts
	await setExitUserPreference( page, 'all_posts' );

	exitHref = await exit.getAttribute( 'href' );

	expect( exitHref ).toContain( '/wp-admin/edit.php?post_type=' );
} );

const setExitUserPreference = async ( page: Page, option: string ) => {
	await page.click( '.elementor-panel-menu-item-editor-preferences' );
	await page.selectOption( '.elementor-control-exit_to >> select', option );
	await page.click( '#elementor-panel-header-menu-button' );
};

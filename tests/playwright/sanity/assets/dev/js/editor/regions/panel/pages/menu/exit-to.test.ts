import { test, expect } from '@playwright/test';
import WpAdminPage from '../../../../../../../../../pages/wp-admin-page';

test( 'Exit to user preference sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	const hasTopBar = await editor.hasTopBar();
	let exit;

	if ( hasTopBar ) {
		// Exit to `dashboard`
		await editor.openUserPreferencesPanel();
		await editor.setSelectControlValue( 'exit_to', 'dashboard' );
		await editor.clickTopBarItem( 'Elementor Logo' );
		await editor.page.waitForTimeout( 100 );
		exit = await editor.page.locator( 'body a', { hasText: 'Exit to WordPress' } ).getAttribute( 'href' );
		await page.press( 'body', 'Escape' );
		expect( exit ).toContain( '/wp-admin/' );

		// Exit to `this_post`
		await editor.openUserPreferencesPanel();
		await editor.setSelectControlValue( 'exit_to', 'this_post' );
		await editor.clickTopBarItem( 'Elementor Logo' );
		await editor.page.waitForTimeout( 100 );
		exit = await editor.page.locator( 'body a', { hasText: 'Exit to WordPress' } ).getAttribute( 'href' );
		await page.press( 'body', 'Escape' );
		expect( exit ).toContain( '/wp-admin/post.php?post=' );

		// Exit to `all_posts`
		await editor.openUserPreferencesPanel();
		await editor.setSelectControlValue( 'exit_to', 'all_posts' );
		await editor.clickTopBarItem( 'Elementor Logo' );
		await editor.page.waitForTimeout( 100 );
		exit = await editor.page.locator( 'body a', { hasText: 'Exit to WordPress' } ).getAttribute( 'href' );
		await page.press( 'body', 'Escape' );
		expect( exit ).toContain( '/wp-admin/edit.php?post_type=' );
	} else {
		// Exit to `dashboard`
		await editor.openUserPreferencesPanel();
		await editor.setSelectControlValue( 'exit_to', 'dashboard' );
		await editor.openMenuPanel();
		exit = await page.locator( '.elementor-panel-menu-item-exit > a' ).getAttribute( 'href' );
		expect( exit ).toContain( '/wp-admin/' );

		// Exit to `this_post`
		await editor.openElementsPanel();
		await editor.openUserPreferencesPanel();
		await editor.setSelectControlValue( 'exit_to', 'this_post' );
		await editor.openMenuPanel();
		exit = await page.locator( '.elementor-panel-menu-item-exit > a' ).getAttribute( 'href' );
		expect( exit ).toContain( '/wp-admin/post.php?post=' );

		// Exit to `all_posts`
		await editor.openElementsPanel();
		await editor.openUserPreferencesPanel();
		await editor.setSelectControlValue( 'exit_to', 'all_posts' );
		await editor.openMenuPanel();
		exit = await page.locator( '.elementor-panel-menu-item-exit > a' ).getAttribute( 'href' );
		expect( exit ).toContain( '/wp-admin/edit.php?post_type=' );
	}
} );

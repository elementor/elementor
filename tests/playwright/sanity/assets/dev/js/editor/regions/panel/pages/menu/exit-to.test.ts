import { test, expect, type Page } from '@playwright/test';
import WpAdminPage from '../../../../../../../../../pages/wp-admin-page';

test( 'Exit to user preference sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.openNewPage();

	// Open User Preferences
	await editor.openUserPreferencesPanel();

	// Default is "This Post" (wp_post_type)
	let exitHref = await editor.getExitToWordpressUrl();
	expect( exitHref ).toContain( '/wp-admin/post.php?post=' );

	// Select dashboard
	await setExitUserPreference( page, 'dashboard' );
	exitHref = await editor.getExitToWordpressUrl();
	expect( exitHref ).toContain( '/wp-admin/' );

	// Select all_posts
	await setExitUserPreference( page, 'all_posts' );
	exitHref = await editor.getExitToWordpressUrl();
	expect( exitHref ).toContain( '/wp-admin/edit.php?post_type=' );
} );

const setExitUserPreference = async ( page: Page, option: string ) => {
	await page.selectOption( '.elementor-control-exit_to >> select', option );
};

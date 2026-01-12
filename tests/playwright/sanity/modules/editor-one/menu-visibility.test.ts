import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

test.describe( 'Editor One Menu Visibility', () => {
	let editorUser: { id: string; username: string; password: string };
	let contributorUser: { id: string; username: string; password: string };

	test.beforeAll( async ( { browser, apiRequests } ) => {
		await wpCli( 'wp elementor experiments activate e_editor_one' );

		const context = await browser.newContext();
		const page = await context.newPage();

		editorUser = await apiRequests.createNewUser( page.context().request, {
			username: 'editorUser',
			password: 'password',
			email: 'editor@test1.com',
			roles: [ 'editor' ],
		} );

		contributorUser = await apiRequests.createNewUser( page.context().request, {
			username: 'contributorUser',
			password: 'password',
			email: 'contributor@test1.com',
			roles: [ 'contributor' ],
		} );

		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests } ) => {
		const context = await browser.newContext();
		const page = await context.newPage();

		if ( editorUser?.id ) {
			await apiRequests.deleteUser( page.context().request, editorUser.id );
		}
		if ( contributorUser?.id ) {
			await apiRequests.deleteUser( page.context().request, contributorUser.id );
		}

		await context.close();

		await wpCli( 'wp elementor experiments deactivate e_editor_one' );
	} );

	test( 'Admin user: Elementor menu is visible with correct submenu items', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		await wpAdmin.openWordPressDashboard();

		const elementorMenu = page.locator( '#toplevel_page_elementor-home' );
		await expect( elementorMenu ).toBeVisible();

		await page.goto( '/wp-admin/admin.php?page=elementor' );

		const sidebar = page.locator( '#editor-one-sidebar-navigation' );
		await expect( sidebar ).toBeVisible();

		await expect( sidebar.getByRole( 'button', { name: 'Quick Start' } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Settings' } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Tools' } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Role Manager' } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Submissions' } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Templates' } ).first() ).toBeVisible();
	} );

	test( 'Editor user: Elementor menu is visible with correct submenu items', async ( { browser, apiRequests }, testInfo ) => {
		const editorContext = await browser.newContext( { storageState: undefined } );
		const editorPage = await editorContext.newPage();
		const wpAdmin = new WpAdminPage( editorPage, testInfo, apiRequests );

		await wpAdmin.customLogin( editorUser.username, editorUser.password );
		await wpAdmin.openWordPressDashboard();

		const elementorMenu = editorPage.locator( '#toplevel_page_elementor-home' );
		await expect( elementorMenu ).toBeVisible();

		await elementorMenu.click();

		await editorPage.waitForURL( /admin\.php\?page=elementor-editor/ );

		const sidebar = editorPage.locator( '#editor-one-sidebar-navigation' );
		await expect( sidebar ).toBeVisible();

		const templatesButton = sidebar.getByRole( 'button', { name: 'Templates' } ).first();
		await expect( templatesButton ).toBeVisible();

		await templatesButton.click();

		await expect( sidebar.getByRole( 'button', { name: 'Quick Start' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Settings' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Tools' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Role Manager' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Submissions' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Templates' } ).first() ).toBeVisible();

		await expect( sidebar.getByRole( 'link', { name: /Saved Templates/i } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'link', { name: /Theme Builder/i } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'link', { name: /Floating Elements/i } ).first() ).not.toBeVisible();

		await editorContext.close();
	} );

	test( 'Contributor user: Elementor menu is visible with correct submenu items', async ( { browser, apiRequests }, testInfo ) => {
		const contributorContext = await browser.newContext( { storageState: undefined } );
		const contributorPage = await contributorContext.newPage();
		const wpAdmin = new WpAdminPage( contributorPage, testInfo, apiRequests );

		await wpAdmin.customLogin( contributorUser.username, contributorUser.password );
		await wpAdmin.openWordPressDashboard();

		const elementorMenu = contributorPage.locator( '#toplevel_page_elementor-home' );
		await expect( elementorMenu ).toBeVisible();

		await elementorMenu.click();

		await contributorPage.waitForURL( /admin\.php\?page=elementor-editor/ );

		const sidebar = contributorPage.locator( '#editor-one-sidebar-navigation' );
		await expect( sidebar ).toBeVisible();

		const templatesButton = sidebar.getByRole( 'button', { name: 'Templates' } ).first();
		await expect( templatesButton ).toBeVisible();

		await templatesButton.click();

		await expect( sidebar.getByRole( 'button', { name: 'Quick Start' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Settings' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Tools' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Role Manager' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Submissions' } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'button', { name: 'Templates' } ).first() ).toBeVisible();

		await expect( sidebar.getByRole( 'link', { name: /Saved Templates/i } ).first() ).toBeVisible();
		await expect( sidebar.getByRole( 'link', { name: /Theme Builder/i } ).first() ).not.toBeVisible();
		await expect( sidebar.getByRole( 'link', { name: /Floating Elements/i } ).first() ).not.toBeVisible();

		await contributorContext.close();
	} );
} );

import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { newUser } from '../checklist/new-user';
import { expect } from '@playwright/test';

test.describe( 'Atomic button widget sanity tests @v4-tests', () => {
	let newTestUser: { id: string; username: string; password: string };

	test.beforeAll( async ( { browser, apiRequests, request }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			e_opt_in_v4_page: 'active',
			e_atomic_elements: 'active',
		} );

		newTestUser = await apiRequests.createNewUser( request, newUser );
		await page.close();
	} );

	test.afterAll( async ( { browser, apiRequests, request }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await apiRequests.deleteUser( request, newTestUser.id );
		await page.close();
	} );

	test( 'Button can be added to the page', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const button = await editor.getWidget( buttonId );

		// Assert.
		expect( await button.innerText() ).toBe( 'Click here' );
	} );

	test( 'Button text can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const newText = 'New Button Text';

		await editor.openV2PanelTab( 'general' );
		await editor.v4Panel.fillField( 0, newText );
		const button = await editor.getWidget( buttonId );

		await expect( button ).toHaveText( newText, { timeout: 1000 } );
	} );

	test( 'Button link can be set', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const linkUrl = 'https://example.com';

		await editor.openV2PanelTab( 'general' );
		await page.locator( '[aria-label="Toggle link"]' ).click();
		await editor.v4Panel.fillField( 1, linkUrl );
		const button = await editor.getWidget( buttonId );
		const anchor = button.locator( 'a' );

		await expect( anchor ).toHaveAttribute( 'href', linkUrl );
	} );

	test( 'Button link target can be set _blank within author role', async ( { apiRequests, browser }, testInfo ) => {
		const context = await browser.newContext( { storageState: undefined } );
		const newScopePage = await context.newPage();
		const wpAdmin = new WpAdminPage( newScopePage, testInfo, apiRequests );

		await wpAdmin.customLogin( newTestUser.username, newTestUser.password );

		const editor = await wpAdmin.openNewPage( false, false );

		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await newScopePage.locator( '[aria-label="Toggle link"]' ).click();
		await editor.v4Panel.fillField( 1, 'https://example.com' );
		await newScopePage.locator( 'text="Open in a new tab"' )
			.locator( 'xpath=..' )
			.locator( 'xpath=./following-sibling::*[1]' )
			.locator( '> :first-child' )
			.locator( '> :first-child' )
			.click();

		await editor.saveAndReloadPage();
		const button = await editor.getWidget( buttonId );
		await expect.soft( button.locator( '> a' ) ).toHaveAttribute( 'target', '_blank' );
		await context.close();
		await newScopePage.close();
	} );

	test( 'Button size can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'size' );
		await editor.v4Panel.setWidgetSize( {
			width: 200,
			height: 60,
		} );

		const button = editor.getPreviewFrame().locator( `[data-id="${ buttonId }"] button` );
		const buttonBox = await button.boundingBox();

		expect( buttonBox.width ).toBe( 200 );
		expect( buttonBox.height ).toBe( 60 );
	} );

	test( 'ID control sanity test', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const buttonCssId = 'custom-button-id';

		await editor.openV2PanelTab( 'general' );
		await editor.v4Panel.fillField( 1, buttonCssId );

		const button = await editor.getWidget( buttonId );
		const anchor = button.locator( 'button' );
		const idLabel = page.locator( '.MuiFormLabel-root:has-text("ID")' );

		await expect( anchor ).toHaveAttribute( 'id', buttonCssId, { timeout: 1000 } );
		await expect( idLabel ).toBeVisible();
	} );
} );

import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.setExperiments( {
		e_opt_in_v4_page: 'active',
		e_atomic_elements: 'active',
	} );
	await page.close();
} );

test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
	const context = await browser.newContext();
	const page = await context.newPage();
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdmin.resetExperiments();
	await page.close();
} );

test.describe( 'Atomic button widget sanity tests @v4-tests', () => {
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
} );

import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { expect } from '@playwright/test';

test.describe( 'V4 atomic button widget tests @promotions', () => {
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

		expect( await button.innerText() ).toBe( newText );
	} );

	test( 'Button link can be set', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const linkUrl = 'https://example.com';

		await editor.openV2PanelTab( 'general' );
		await page.locator( '[aria-label="Toggle link"]' ).click();
		await editor.v4Panel.fillField( 1, linkUrl );
		const button = await editor.getWidget( buttonId );

		expect( await button.getAttribute( 'href' ) ).toBe( linkUrl );
	} );

	test.skip( 'Button size can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'size' );
		await page.locator( '.elementor-control-width input' ).fill( '200' );
		await page.locator( '.elementor-control-height input' ).fill( '60' );

		const button = await editor.getWidget( buttonId );
		const buttonBox = await button.boundingBox();

		expect( buttonBox.width ).toBe( 200 );
		expect( buttonBox.height ).toBe( 60 );
	} );

	test.skip( 'Button color can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const color = '#FF0000';

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'background' );
		await page.locator( '.elementor-control-background_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-result' ).fill( color );
		await page.locator( '.elementor-control-background_color' ).click();

		const button = await editor.getWidget( buttonId );
		expect( await button.evaluate( ( el ) => window.getComputedStyle( el ).backgroundColor ) ).toBe( 'rgb(255, 0, 0)' );
	} );

	test.skip( 'Button typography can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'typography' );
		await page.locator( '.elementor-control-font_size input' ).fill( '24' );
		await page.locator( '.elementor-control-text_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-result' ).fill( '#0000FF' );
		await page.locator( '.elementor-control-text_color' ).click();

		const button = await editor.getWidget( buttonId );
		const computedStyle = await button.evaluate( ( el ) => window.getComputedStyle( el ) );

		expect( computedStyle.fontSize ).toBe( '24px' );
		expect( computedStyle.color ).toBe( 'rgb(0, 0, 255)' );
	} );

	test.skip( 'Button border can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'border' );
		await page.locator( '.elementor-control-border_width input' ).fill( '5' );
		await page.locator( '.elementor-control-border_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-result' ).fill( '#00FF00' );
		await page.locator( '.elementor-control-border_color' ).click();

		const button = await editor.getWidget( buttonId );
		const computedStyle = await button.evaluate( ( el ) => window.getComputedStyle( el ) );

		expect( computedStyle.borderWidth ).toBe( '5px' );
		expect( computedStyle.borderColor ).toBe( 'rgb(0, 255, 0)' );
	} );

	test.skip( 'Button hover effects work', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'background' );
		await page.locator( '.elementor-control-background_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-result' ).fill( '#FF0000' );
		await page.locator( '.elementor-control-background_color' ).click();
		await page.locator( '.elementor-control-background_hover_color .pcr-button' ).click();
		await page.locator( '.pcr-app.visible .pcr-result' ).fill( '#00FF00' );
		await page.locator( '.elementor-control-background_hover_color' ).click();

		const button = await editor.getWidget( buttonId );
		await button.hover();

		expect( await button.evaluate( ( el ) => window.getComputedStyle( el ).backgroundColor ) ).toBe( 'rgb(0, 255, 0)' );
	} );

	test.skip( 'Button alignment can be changed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );

		await editor.openV2PanelTab( 'style' );
		await editor.openV2Section( 'position' );
		await page.locator( '.elementor-control-align .eicon-align-center-h' ).click();

		const button = await editor.getWidget( buttonId );
		expect( await button.evaluate( ( el ) => window.getComputedStyle( el ).textAlign ) ).toBe( 'center' );
	} );

	test.skip( 'Button can be published and viewed', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const container = await editor.addElement( { elType: 'container' }, 'document' );
		const buttonId = await editor.addWidget( { widgetType: 'e-button', container } );
		const buttonText = 'Published Button';

		await editor.openV2PanelTab( 'general' );
		await page.locator( '.elementor-control-text input' ).fill( buttonText );
		await editor.publishAndViewPage();

		const publishedButton = page.locator( `[data-id="${ buttonId }"]` );
		await expect( publishedButton ).toBeVisible();
		await expect( publishedButton ).toHaveText( buttonText );
	} );
} );

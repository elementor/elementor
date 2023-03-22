const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );
const widgets = require( '../enums/widgets.js' );

test.describe( 'Section tests', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
	} );

	test( 'Verify that elements are in the correct order after passing into a new section', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost(),
			sectionId1 = await editor.addElement( { elType: 'section' }, 'document' ),
			sectionId2 = await editor.addElement( { elType: 'section' }, 'document' );

		// Add widgets.
		await editor.addWidget( widgets.button, sectionId1 );
		await editor.addWidget( widgets.heading, sectionId2 );

		// Copy section 1.
		const section1 = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + sectionId1 );
		await section1.hover();
		await editor.getPreviewFrame().locator( `.elementor-element-${ sectionId1 } > .elementor-element-overlay .elementor-editor-element-edit` ).click( { button: 'right' } );
		await expect( page.locator( '.elementor-context-menu-list__item-copy' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__item-copy' ).click();

		// Open Add Section Inline element.
		const element = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + sectionId2 );
		await element.hover();
		const elementAddButton = editor.getPreviewFrame().locator( '.elementor-edit-mode .elementor-element-' + sectionId2 + ' > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-add' );
		await elementAddButton.click();
		await editor.getPreviewFrame().waitForSelector( '.elementor-add-section-inline' );

		// Paste section 1 onto New section element.
		await editor.getPreviewFrame().locator( '.elementor-add-section-inline' ).click( { button: 'right' } );
		await expect( page.locator( '.elementor-context-menu-list__group-paste .elementor-context-menu-list__item-paste' ) ).toBeVisible();
		await page.locator( '.elementor-context-menu-list__group-paste .elementor-context-menu-list__item-paste' ).click();

		// Assert.
		// Verify that the first section has a `data-id` value of `sectionId1`.
		await expect( await editor.getPreviewFrame().locator( '.e-con >> nth=0' ).getAttribute( 'data-id' ) ).toEqual( sectionId1 );
		// Verify that the second section doesn't have a `data-id` value of `sectionId1` or `sectionId2`.
		await expect( await editor.getPreviewFrame().locator( '.e-con >> nth=1' ).getAttribute( 'data-id' ) ).not.toEqual( sectionId1 );
		await expect( await editor.getPreviewFrame().locator( '.e-con >> nth=1' ).getAttribute( 'data-id' ) ).not.toEqual( sectionId2 );
		// Verify that the second section has a button widget.
		await expect( await editor.getPreviewFrame().locator( '.e-con >> nth=1 .elementor-widget' ) ).toHaveClass( /elementor-widget-button/ );
		// Verify that the third section has `a `data-id` value of `sectionId2`.
		await expect( await editor.getPreviewFrame().locator( '.e-con >> nth=2' ).getAttribute( 'data-id' ) ).toEqual( sectionId2 );
	} );
} );

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
		new WpAdminPage( page, testInfo );
	} );

	test( 'Verify that elements are in the correct order after passing into a new section', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.useElementorCleanPost(),
			sectionId1 = await editor.addElement( { elType: 'section' }, 'document' ),
			sectionId2 = await editor.addElement( { elType: 'section' }, 'document' ),
			section1Column = await editor.getPreviewFrame().locator( '.elementor-element-' + sectionId1 + ' .elementor-column' ),
			section1ColumnId = await section1Column.getAttribute( 'data-id' ),
			section2Column = await editor.getPreviewFrame().locator( '.elementor-element-' + sectionId2 + ' .elementor-column' ),
			section2ColumnId = await section2Column.getAttribute( 'data-id' );

		// Add widgets.
		await editor.addWidget( widgets.button, section1ColumnId );
		await editor.addWidget( widgets.heading, section2ColumnId );

		// Copy section 1.
		await editor.copyElement( sectionId1 );

		// Open Add Section Inline element.
		await editor.openAddElementSection( sectionId2 );

		// Paste section 1 onto New section element.
		await editor.pasteElement( '.elementor-add-section-inline' );

		// Assert.
		// Verify that the first section has a `data-id` value of `sectionId1`.
		await expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=0' ).getAttribute( 'data-id' ) ).toEqual( sectionId1 );
		// Verify that the second section doesn't have a `data-id` value of `sectionId1` or `sectionId2`.
		await expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=1' ).getAttribute( 'data-id' ) ).not.toEqual( sectionId1 );
		await expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=1' ).getAttribute( 'data-id' ) ).not.toEqual( sectionId2 );
		// Verify that the second section has a button widget.
		await expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=1' ).locator( '.elementor-widget' ) ).toHaveClass( /elementor-widget-button/ );
		// Verify that the third section has `a `data-id` value of `sectionId2`.
		await expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=2' ).getAttribute( 'data-id' ) ).toEqual( sectionId2 );
	} );
} );

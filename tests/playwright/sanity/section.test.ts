import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import widgets from '../enums/widgets';

test.describe( 'Section tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( {
			container: false,
		} );
		await page.close();
	} );

	test( 'Verify that elements are in the correct order after passing into a new section', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage(),
			sectionId1 = await editor.addElement( { elType: 'section' }, 'document' ),
			sectionId2 = await editor.addElement( { elType: 'section' }, 'document' ),
			section1Column = editor.getPreviewFrame().locator( '.elementor-element-' + sectionId1 + ' .elementor-column' ),
			section1ColumnId = await section1Column.getAttribute( 'data-id' ),
			section2Column = editor.getPreviewFrame().locator( '.elementor-element-' + sectionId2 + ' .elementor-column' ),
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
		expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=0' ).getAttribute( 'data-id' ) ).toEqual( sectionId1 );
		// Verify that the second section doesn't have a `data-id` value of `sectionId1` or `sectionId2`.
		expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=1' ).getAttribute( 'data-id' ) ).not.toEqual( sectionId1 );
		expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=1' ).getAttribute( 'data-id' ) ).not.toEqual( sectionId2 );
		// Verify that the second section has a button widget.
		await expect( editor.getPreviewFrame().locator( '.elementor-section >> nth=1' ).locator( '.elementor-widget' ) ).toHaveClass( /elementor-widget-button/ );
		// Verify that the third section has `a `data-id` value of `sectionId2`.
		expect( await editor.getPreviewFrame().locator( '.elementor-section >> nth=2' ).getAttribute( 'data-id' ) ).toEqual( sectionId2 );
	} );
} );

const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page' );
const widgets = require( '../enums/widgets.js' );

test.describe( 'Video tests inside a container', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: true,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Verify that there is no gap between the video widget and the container', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			containerId = await editor.addElement( { elType: 'container' }, 'document' ),
			videoId = await editor.addWidget( widgets.video, containerId );

		// Act.
		// Set container padding to 0.
		await editor.selectElement( containerId );
		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-padding .elementor-control-dimension input' ).first().fill( '0' );

		const container = await editor.getPreviewFrame().locator( `.elementor-element-${ containerId }` ),
			containerHeight = await container.boundingBox().height,
			videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox().height;

		// Assert.
		// Verify that the container has an equal height to the video iFrame.
		expect( containerHeight ).toEqual( videoIframeHeight );
	} );
} );

test.describe( 'Video tests inside a section', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test.afterAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext(),
			page = await context.newPage(),
			wpAdmin = new WpAdminPage( page, testInfo );

		await wpAdmin.setExperiments( {
			container: false,
		} );
	} );

	test( 'Verify that there is no gap between the video widget and the section', async ( { page }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo ),
			editor = await wpAdmin.useElementorCleanPost(),
			sectionId = await editor.addElement( { elType: 'section' }, 'document' ),
			column = await editor.getPreviewFrame().locator( '.elementor-element-' + sectionId + ' .elementor-column' ),
			columnId = await column.getAttribute( 'data-id' ),
			videoId = await editor.addWidget( widgets.video, columnId );

		// Act.
		// Set section padding to 0.
		await editor.selectElement( columnId );
		await editor.activatePanelTab( 'advanced' );
		await page.locator( '.elementor-control-padding .elementor-control-dimension input' ).first().fill( '0' );

		const columnHeight = await column.boundingBox().height,
			videoIframeHeight = await editor.getPreviewFrame().locator( `.elementor-element-${ videoId } iframe` ).boundingBox().height;

		// Assert.
		// Verify that the container has an equal height to the video iFrame.
		expect( columnHeight ).toEqual( videoIframeHeight );
	} );
} );

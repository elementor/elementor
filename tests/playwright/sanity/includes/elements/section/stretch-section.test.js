const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../../pages/wp-admin-page' );

test( 'Stretch section', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

	await editor.closeNavigatorIfOpen();

	await editor.getPreviewFrame().evaluate( () => {
		const sectionWrap = document.querySelector( '.elementor-section-wrap:first-child' );

		sectionWrap.style.width = '800px';
		sectionWrap.style.margin = '0 auto';
	} );

	// Act.
	const sectionID = await editor.addElement( { elType: 'section' }, 'document' ),
		sectionElement = await editor.getPreviewFrame().locator( `.elementor-element-${ sectionID }` );

	await editor.setBackgroundColor( '#ef9595', sectionID, false );
	await editor.activatePanelTab( 'layout' );
	await page.selectOption( '.elementor-control-layout select', 'boxed' );

	// Assert (Not Stretched).
	expect( await sectionElement.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( 'section-NOT-stretched.jpeg' );

	// Act.
	await page.locator( '.elementor-control-stretch_section .elementor-switch' ).click();

	// Assert (Stretched).
	expect( await sectionElement.screenshot( {
		type: 'jpeg',
		quality: 90,
	} ) ).toMatchSnapshot( 'section-stretched.jpeg' );
} );

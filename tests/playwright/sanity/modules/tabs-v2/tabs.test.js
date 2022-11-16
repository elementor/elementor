const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test( 'Tab icon align-items center', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	await wpAdmin.setExperiments( {
		container: true,
		'nested-elements': true,
	} );

	const editor = await wpAdmin.useElementorCleanPost(),
		container = await editor.addElement( { elType: 'container' }, 'document' );

	// Add widgets.
	await editor.addWidget( 'tabs-v2', container );
	await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );

	// Set icons to tabs


	// Click #elementor-controls >> text=Tab #1
	const TabsIcons = [
		{
			icon: 'fa-arrow-alt-circle-right',
			activeIcon: 'fa-bookmark',
		},
		{
			icon: 'fa-clipboard',
			activeIcon: 'fa-clock',
		},
		{
			icon: 'fa-closed-captioning',
			activeIcon: 'fa-bell',
		},
	];
	for ( const tab of TabsIcons ) {
		const index = TabsIcons.indexOf( tab ) + 1;
		console.log( { index } )
		await page.locator( `#elementor-controls >> text=Tab #${ index }` ).click();
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index } ) .elementor-control-tab_icon .eicon-circle` ).click();
		await addIcon( page, tab.icon );
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index }  ) .elementor-control-tab_icon_active .eicon-circle` ).click();
		await addIcon( page, tab.activeIcon );
	}
	// Set tabs location


	// Assert.
	const icon = await page.locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon' ).nth( 0 );
	const activeTabIcon = await page.locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon-active' ).first();

	await expect( icon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );
	await expect( activeTabIcon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );

	await page.locator( '.elementor-control.elementor-control-tabs_location_horizontal .elementor-control-content .elementor-control-field .elementor-control-input-wrapper .elementor-choices label' ).first().click();
	await expect( icon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );
	await expect( activeTabIcon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );

	await page.locator( '.eicon-flex.eicon-align-end-h' ).first().click();
	await expect( icon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );
	await expect( activeTabIcon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );

	await page.locator( '.eicon-h-align-center' ).first().click();
	await expect( icon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );
	await expect( activeTabIcon ).toHaveCSS( '--tabs-v2-icon-align-items', 'center' );
} );

const addIcon = async ( page, icon ) => {
	await page.locator( `#elementor-icons-manager__tab__content .${ icon }` ).first().click();
	await page.locator( '.dialog-lightbox-insert_icon' ).click();
};

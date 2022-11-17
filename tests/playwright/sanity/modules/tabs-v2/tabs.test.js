const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test.beforeAll( async ( { page } ) => {
	const wpAdmin = new WpAdminPage( page );

	await wpAdmin.setExperiments( {
		container: true,
		'nested-elements': true,
	} );

	const editor = await wpAdmin.useElementorCleanPost(),
		container = await editor.addElement( { elType: 'container' }, 'document' );

	// Add widgets.
	await editor.addWidget( 'tabs-v2', container );
	await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );

	// Set icons to tabs according 'TabsIcons' array.
	await setIconsToTabs( page, TabsIcons );

} );

test.describe( 'tabs v2 icon vertical alignment', () => {
	test( 'Tabs icons', async ( { page } ) => {

	}

} );


test( 'tabs v2 icon vertical alignment', async ( { page }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo );
	// await wpAdmin.setExperiments( {
	// 	container: true,
	// 	'nested-elements': true,
	// } );

	// const editor = await wpAdmin.useElementorCleanPost(),
	// 	container = await editor.addElement( { elType: 'container' }, 'document' );
	//
	// // Add widgets.
	// await editor.addWidget( 'tabs-v2', container );
	// await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );
	//
	// // Set icons to tabs according 'TabsIcons' array.
	// await setIconsToTabs( page, TabsIcons );

	const icon = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon' ).first();
	const activeTabIcon = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon-active' ).first();

	// Initial state
	await page.locator( '.elementor-control.elementor-control-tabs_location_horizontal .elementor-control-content .elementor-control-field .elementor-control-input-wrapper .elementor-choices label' ).first().click();

	// Assert
	await expect( icon ).toHaveCSS( 'align-items', 'center' );
	await clickTab( editor, 'right' );
	await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );

	// End
	await page.locator( '.eicon-align-end-h' ).first().click();

	// Assert
	await expect( icon ).toHaveCSS( 'align-items', 'center' );
	await clickTab( editor, 'middle' );
	await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );

	// Center
	await page.locator( '.eicon-h-align-center' ).first().click();

	// Assert
	await expect( icon ).toHaveCSS( 'align-items', 'center' );
	await clickTab( editor, 'left' );
	await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );

	// Justified
	await page.locator( '.eicon-h-align-stretch' ).first().click();

	// Assert
	await expect( icon ).toHaveCSS( 'align-items', 'center' );
	await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );
} );

const clickTab = async ( editor, tabPosition ) => {
	const tabs = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tabs-wrapper' ).first();
	tabs.click( { button: tabPosition, clickCount: 1 } );
	// await editor.getPreviewFrame().locator( `.elementor-widget-tabs-v2 .elementor-tab-title:nth-child(${ tabNumber })` ).first().click();
};

const addIcon = async ( page, icon ) => {
	await page.locator( `#elementor-icons-manager__tab__content .${ icon }` ).first().click();
	await page.locator( '.dialog-lightbox-insert_icon' ).click();
};

const locationOptions = {
	horizontal: 'elementor-control-tabs_location_horizontal',
	vertical: 'elementor-control-tabs_location_vertical',
};
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

const setIconsToTabs = async ( page, TabIcons ) => {
	for ( const tab of TabIcons ) {
		const index = TabsIcons.indexOf( tab ) + 1;
		await page.locator( `#elementor-controls >> text=Tab #${ index }` ).click();
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index } ) .elementor-control-tab_icon .eicon-circle` ).click();
		await addIcon( page, tab.icon );
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index }  ) .elementor-control-tab_icon_active .eicon-circle` ).click();
		await addIcon( page, tab.activeIcon );
	}
};

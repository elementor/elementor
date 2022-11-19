const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

test.describe( 'tabs v2 icon vertical alignment', async () => {
	let wpAdmin;
	let editor;
	let icon;
	let activeTabIcon;
	let locationOption;
	const locationOptions = [ 'Start', 'Center', 'End', 'Justified' ];

	for ( locationOption of locationOptions ) {
		// eslint-disable-next-line no-shadow
		test( `Should be vertically centered when location is on ${ locationOption }`, async ( { page }, testInfo ) => {
			wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				container: true,
				'nested-elements': true,
			} );

			editor = await wpAdmin.useElementorCleanPost();
			const container = await editor.addElement( { elType: 'container' }, 'document' );

			// Add widgets.
			await editor.addWidget( 'tabs-v2', container );
			await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );

			// Set icons to tabs according 'TabsIcons' array.
			await setIconsToTabs( page, TabsIcons );
			icon = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon' ).first();
			activeTabIcon = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon-active' ).first();

			await page.locator( `.elementor-control-tabs_location_horizontal [original-title='${ locationOption }']` ).first().click();
			await expect( icon ).toHaveCSS( 'align-items', 'center' );
			await clickTab( editor, '1' );
			await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );
			await clickTab( editor, '0' );
		} );
	}
} );

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

// Set icons to tabs, used in setIconsToTabs function.
const addIcon = async ( page, icon ) => {
	await page.locator( `#elementor-icons-manager__tab__content .${ icon }` ).first().click();
	await page.locator( '.dialog-lightbox-insert_icon' ).click();
};

// Iterate tabs and add an icon and an active Icon to each one.
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

// Click on tab by position.
const clickTab = async ( editor, tabPosition ) => {
	console.log( tabPosition )
	await editor.getPreviewFrame().locator( `.elementor-widget-tabs-v2 .elementor-tabs-wrapper .elementor-tab-title >> nth=${ tabPosition } ` ).first().click();
};

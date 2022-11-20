const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );

// test.beforeEach( async ( { page } ) => {
// 	const wpAdmin = new WpAdminPage( page, testInfo );
// 	await wpAdmin.setExperiments( {
// 		container: true,
// 		'nested-elements': true,
// 	} );
//
// 	const editor = await wpAdmin.useElementorCleanPost(),
// 		container = await editor.addElement( { elType: 'container' }, 'document' );
//
// 	// Add widgets.
// 	await editor.addWidget( 'tabs-v2', container );
// 	await editor.getPreviewFrame().waitForSelector( '.elementor-tabs-content-wrapper .e-con.elementor-active' );
// } );
test.describe( 'Nested Tabs - Tab icon vertical alignment', async () => {
	let locationOption;
	const locationOptions = [ 'Start', 'Center', 'End', 'Justified' ];

	for ( locationOption of locationOptions ) {
		test( `Should be vertically centered when Justify is set on ${ locationOption }`, async ( { page }, testInfo ) => {
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

			// Set icons to tabs according 'TabsIcons' array.
			await setIconsToTabs( page, TabsIcons );
			const icon = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon' ).first(),
				activeTabIcon = await editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tab-title .elementor-tab-icon-active' ).first();

			// Assert
			await page.locator( `.elementor-control-tabs_justify_horizontal [original-title='${ locationOption }']` ).first().click();
			await expect( icon ).toHaveCSS( 'align-items', 'center' );
			await clickTab( editor, '1' );
			await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );
			await clickTab( editor, '0' );
		} );
	}

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
	const addIcon = async ( page, selectedIcon ) => {
		await page.locator( `#elementor-icons-manager__tab__content .${ selectedIcon }` ).first().click();
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
		await editor.getPreviewFrame().locator( `.elementor-widget-tabs-v2 .elementor-tabs-wrapper .elementor-tab-title >> nth=${ tabPosition } ` ).first().click();
	};
} );

test.describe( 'Nested Tabs tests', () => {
	test( 'Count the number of icons inside the Add Section element', async ( { page }, testInfo ) => {
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

		// Act.
		const iconCountForTabs = await editor.getPreviewFrame().locator( '.elementor-tabs-content-wrapper .e-con.elementor-active .elementor-add-new-section i' ).count(),
			iconCountForMainContainer = await editor.getPreviewFrame().locator( '#elementor-add-new-section .elementor-add-new-section i' ).count();

		// Assert.
		// Check if the tabs has 1 icon in the Add Section element and the main container 2 icons.
		expect( iconCountForTabs ).toBe( 1 );
		expect( iconCountForMainContainer ).toBe( 2 );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	test( 'Title alignment setting', async ( { page }, testInfo ) => {
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

		// Act.
		// Set tabs direction to 'stretch'.
		await page.locator( '.elementor-control-tabs_justify_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();

		// Assert.
		// Check if title's are aligned on the left.
		await expect( editor.getPreviewFrame().locator( '.elementor-widget-tabs-v2 .elementor-tabs-wrapper .elementor-tab-title.elementor-active' ) ).toHaveCSS( 'justify-content', 'flex-start' );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );
} );

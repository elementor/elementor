const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page' );
const EditorPage = require( '../../../pages/editor-page' );

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
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		const iconCountForTabs = await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active .elementor-add-new-section i' ).count(),
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
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Act.
		// Set tabs direction to 'stretch'.
		await page.locator( '.elementor-control-tabs_justify_horizontal .elementor-control-input-wrapper .eicon-h-align-stretch' ).click();
		// Set align title to 'start'.
		await page.locator( '.elementor-control-title_alignment .elementor-control-input-wrapper .eicon-text-align-left' ).click();

		// Assert.
		// Check if title's are aligned on the left.
		await expect( editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tabs-heading .e-n-tab-title.e-active' ) ).toHaveCSS( 'justify-content', 'flex-start' );

		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
		} );
	} );

	let locationOption;

	const locationOptions = [ 'Start', 'Center', 'End', 'Justified' ];

	for ( locationOption of locationOptions ) {
		test( `Check that Icons are vertically centered when Justify is set to ${ locationOption }`, async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			await wpAdmin.setExperiments( {
				container: true,
				'nested-elements': true,
			} );

			const editor = await wpAdmin.useElementorCleanPost(),
				container = await editor.addElement( { elType: 'container' }, 'document' );

			// Add widgets.
			await editor.addWidget( 'nested-tabs', container );
			await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

			// Set icons to tabs according 'TabsIcons' array.
			await setIconsToTabs( page, TabsIcons );
			const icon = await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon' ).first(),
				activeTabIcon = await editor.getPreviewFrame().locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon.e-active' ).first(),
				currentContext = editor.getPreviewFrame();

			// Assert.
			await page.locator( `.elementor-control-tabs_justify_horizontal [original-title='${ locationOption }']` ).first().click();
			await expect( icon ).toHaveCSS( 'align-items', 'center' );
			await clickTab( currentContext, '1' );
			await expect( activeTabIcon ).toHaveCSS( 'align-items', 'center' );
			await clickTab( currentContext, '0' );

			// Reset experiments.
			await wpAdmin.setExperiments( {
				container: false,
				'nested-elements': false,
			} );
		} );
	}

	test( `Check visibility of icon svg file when font icons experiment is active`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		// Set experiments.
		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
			e_font_icon_svg: true,
		} );

		await wpAdmin.openNewPage();

		const editor = new EditorPage( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Set icons to tabs according 'TabsIcons' array.
		await setIconsToTabs( page, TabsIcons );
		await editor.publishAndViewPage();
		await page.waitForSelector( '.elementor-widget-n-tabs' );

		// Set published page variables
		const icon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon' ).first(),
			activeTabIcon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon.e-active' ).first(),
			currentContext = page;

		// Assert
		await expect( activeTabIcon ).toBeVisible();
		await clickTab( currentContext, '1' );
		await expect( icon ).toBeVisible();
		await clickTab( currentContext, '0' );

		// Reset experiments.
		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
			e_font_icon_svg: false,
		} );
	} );

	test( `Check the icon size on frontEnd`, async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		// Set experiments.
		await wpAdmin.setExperiments( {
			container: true,
			'nested-elements': true,
			e_font_icon_svg: true,
		} );

		await wpAdmin.openNewPage();

		const editor = new EditorPage( page, testInfo ),
			container = await editor.addElement( { elType: 'container' }, 'document' );

		// Add widgets.
		await editor.addWidget( 'nested-tabs', container );
		await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content .e-con.e-active' );

		// Set icons to tabs according 'TabsIcons' array.
		await setIconsToTabs( page, TabsIcons );

		// Set icon size.
		await page.locator( '.elementor-tab-control-style' ).click();
		await page.locator( '.elementor-control-icon_section_style' ).click();
		await page.locator( '.elementor-control-icon_size [data-setting="size"]' ).first().fill( '50' );
		await editor.publishAndViewPage();

		// Set published page variables
		const icon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon svg' ).first(),
			activeTabIcon = await page.locator( '.elementor-widget-n-tabs .e-n-tab-title .e-n-tab-icon.e-active svg' ).first(),
			currentContext = page;

		// Assert
		await expect( activeTabIcon ).toBeVisible();
		await expect( activeTabIcon ).toHaveCSS( 'height', '50px' );
		await clickTab( currentContext, '1' );
		await expect( icon ).toBeVisible();
		await expect( icon ).toHaveCSS( 'height', '50px' );
		await clickTab( currentContext, '0' );

		// Reset experiments
		await wpAdmin.setExperiments( {
			container: false,
			'nested-elements': false,
			e_font_icon_svg: false,
		} );
	} );
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
const clickTab = async ( context, tabPosition ) => {
	await context.locator( `.elementor-widget-n-tabs .e-n-tab-title >> nth=${ tabPosition } ` ).first().click();
};

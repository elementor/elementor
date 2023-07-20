import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';
import { Frame, type Page } from '@playwright/test';

const tabIcons = [
	{
		icon: 'fa-arrow-alt-circle-right',
		activeIcon: 'fa-bookmark',
	},
	{
		icon: 'fa-clipboard',
		activeIcon: 'fa-clock',
	},
	{
		icon: 'fa-clipboard',
		activeIcon: 'fa-address-card',
	},
];

// Set icons to tabs, used in setIconsToTabs function.
async function addIcon( page: Page, selectedIcon: string ) {
	await page.locator( `#elementor-icons-manager__tab__content .${ selectedIcon }` ).first().click();
	await page.locator( '.dialog-lightbox-insert_icon' ).click();
}

// Iterate tabs and add an icon and an active Icon to each one.
async function setIconsToTabs( page: Page, TabIcons: Array<{ icon: string; activeIcon: string; }> ) {
	for ( const tab of TabIcons ) {
		const index = tabIcons.indexOf( tab ) + 1;
		await page
			.locator( `#elementor-controls >> text=Tab #${ index }` )
			.click();
		await page
			.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index } ) .elementor-control-tab_icon .eicon-circle` )
			.click();
		await addIcon( page, tab.icon );
		await page
			.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index }  ) .elementor-control-tab_icon_active .eicon-circle` )
			.click();
		await addIcon( page, tab.activeIcon );
	}
}

export async function editTab( editor: EditorPage, tabIndex: string ) {
	const tabTitleSelector = '.e-n-tabs-heading .e-n-tab-title';
	await editor.getPreviewFrame().waitForSelector( `${ tabTitleSelector }.e-active` );
	const tabTitle = editor.getPreviewFrame().locator( `${ tabTitleSelector }>>nth=${ tabIndex }` );
	await tabTitle.click();
	await editor.page.waitForTimeout( 100 );
	return await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active.elementor-element-edit-mode' ).getAttribute( 'data-id' );
}

// Click on tab by position.
export async function clickTab( context: Page | Frame, tabPosition: string ) {
	await context.locator( `.elementor-widget-n-tabs .e-n-tab-title >> nth=${ tabPosition }` ).first().click();
}

// Click on tab by position.
export async function clickMobileTab( context: Page, tabPosition: string ) {
	await context.locator( `.elementor-widget-n-tabs .e-collapse >> nth=${ tabPosition }` ).first().click();
}

export async function setup( wpAdmin: WpAdminPage, customExperiment: {[ n: string ]: boolean | string } | '' = '' ) {
	let experiments = {
		container: 'active',
		'nested-elements': 'active',
	};

	experiments = { ...experiments, ...customExperiment };
	await wpAdmin.setExperiments( experiments );
}

export async function cleanup( wpAdmin: WpAdminPage, customExperiment: {[ n: string ]: boolean | string } | '' = '' ) {
	let experiments = {
		'nested-elements': 'inactive',
		container: 'inactive',
	};

	experiments = { ...experiments, ...customExperiment };
	await wpAdmin.setExperiments( experiments );
}

export async function setTabItemColor(
	page: Page,
	editor: EditorPage,
	panelClass: string,
	tabState: string,
	colorPickerClass: string,
	color: string ) {
	await editor.activatePanelTab( 'style' );
	if ( 'tabs' !== panelClass ) {
		await page.locator( `.elementor-control-${ panelClass }` ).click();
	}
	await page.locator( `.elementor-control-${ tabState }` ).click();
	await page.locator( `.elementor-control-${ colorPickerClass } .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

export async function setTabBorderColor(
	page: Page,
	editor: EditorPage,
	state: string,
	stateExtended: string,
	color: string,
	borderWidth: string,
	borderStyle = 'solid' ) {
	await editor.activatePanelTab( 'style' );
	await page.locator( `.elementor-control-section_tabs_style` ).click();
	await page.locator( `.elementor-control-tabs_title_${ state }` ).click();
	await page.selectOption( `.elementor-control-tabs_title_border${ stateExtended }_border >> select`, borderStyle );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_width .elementor-control-input-wrapper input` )
		.first().
		fill( borderWidth );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_color .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

export async function selectDropdownContainer( editor: EditorPage, itemNumber = '0' ) {
	const isActiveTab = await editor.getPreviewFrame()
		.locator( `.e-normal >> nth=${ itemNumber }` )
		.evaluate( ( element: HTMLElement ) => element.classList.contains( 'e-active ' ) );

	if ( ! isActiveTab ) {
		await clickTab( editor.getPreviewFrame(), itemNumber );
	}

	await editor.getPreviewFrame().locator( '.e-n-tabs-content > .e-con.e-active' ).hover();
	const elementEditButton = editor.getPreviewFrame()
		.locator( '.e-con.e-active > .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
	await elementEditButton.click();
	await editor.getPreviewFrame().waitForSelector( '.e-n-tabs-content > .e-con.e-active' );
	return await editor.getPreviewFrame().locator( '.e-n-tabs-content > .e-con.e-active' ).getAttribute( 'data-id' );
}

export async function setBackgroundVideoUrl( page: Page, editor: EditorPage, elementId: string, videoUrl: string ) {
	await editor.selectElement( elementId );
	await editor.activatePanelTab( 'style' );
	await page.locator( '.eicon-video-camera' ).first().click();
	await page.locator( '.elementor-control-background_video_link input' ).fill( videoUrl );
}

module.exports = {
	tabIcons,
	addIcon,
	setIconsToTabs,
	editTab,
	clickTab,
	clickMobileTab,
	cleanup,
	setup,
	setTabBorderColor,
	setTabItemColor,
	selectDropdownContainer,
	setBackgroundVideoUrl,
};

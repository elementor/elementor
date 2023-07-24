import { type Page, type Frame } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';

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
export async function addIcon( page: Page, selectedIcon: string ) {
	await page.locator( `#elementor-icons-manager__tab__content .${ selectedIcon }` ).first().click();
	await page.locator( '.dialog-lightbox-insert_icon' ).click();
}

// Iterate tabs and add an icon and an active Icon to each one.
export async function setIconsToTabs( page: Page, TabIcons: Array<{ icon: string; activeIcon: string; }> ) {
	for ( const tab of TabIcons ) {
		const index = tabIcons.indexOf( tab ) + 1;
		await page.locator( `#elementor-controls >> text=Tab #${ index }` ).click();
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index } ) .elementor-control-tab_icon .eicon-circle` ).click();
		await addIcon( page, tab.icon );
		await page.locator( `.elementor-repeater-fields-wrapper.ui-sortable .elementor-repeater-fields:nth-child( ${ index }  ) .elementor-control-tab_icon_active .eicon-circle` ).click();
		await addIcon( page, tab.activeIcon );
	}
}

export async function editTab( editor: EditorPage, tabIndex: string ) {
	const tabTitleSelector = '.e-n-tabs-heading .e-n-tab-title';
	await editor.getPreviewFrame().waitForSelector( `${ tabTitleSelector }[aria-selected="true"]` );
	const tabTitle = await editor.getPreviewFrame().locator( `${ tabTitleSelector }>>nth=${ tabIndex }` );
	await tabTitle.click();
	await editor.page.waitForTimeout( 100 );
	return await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active.elementor-element-edit-mode' ).getAttribute( 'data-id' );
}

// Click on tab by position.
export async function clickTab( context: Page | Frame, tabPosition: number ) {
	await context.locator( `.elementor-widget-n-tabs-html .e-n-tab-title >> nth=${ String( tabPosition ) }` ).first().click();
}

export async function setup( wpAdmin: WpAdminPage, customExperiment: {[ n: string ]: boolean | string } | '' = '' ) {
	let experiments = {
		'nested-elements-html': 'active',
		container: 'active',
		'nested-elements': 'active',
	};

	experiments = { ...experiments, ...customExperiment };
	await wpAdmin.setExperiments( experiments );
}

export async function cleanup( wpAdmin, customExperiment: {[ n: string ]: boolean | string } | '' = '' ) {
	let experiments = {
		'nested-elements-html': 'inactive',
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
	color: string,
) {
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
	borderStyle: string = 'solid',
) {
	await editor.activatePanelTab( 'style' );
	await page.locator( `.elementor-control-section_tabs_style` ).click();
	await page.locator( `.elementor-control-tabs_title_${ state }` ).click();
	await page.selectOption( `.elementor-control-tabs_title_border${ stateExtended }_border >> select`, borderStyle );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_width .elementor-control-input-wrapper input` )
		.first()
		.fill( borderWidth );
	await page.locator( `.elementor-control-tabs_title_border${ stateExtended }_color .pcr-button` ).click();
	await page.fill( '.pcr-app.visible .pcr-interaction input.pcr-result', color );
}

export async function selectDropdownContainer( editor: EditorPage, widgetId = '', itemNumber = 0 ) {
	const widgetSelector = !! widgetId ? `.elementor-element-${ widgetId } ` : '',
		activeContainerSelector = `${ widgetSelector }.e-n-tabs-content > .e-con >> nth=${ itemNumber }`,
		isActiveTab = await editor.getPreviewFrame()
			.locator( `${ widgetSelector }.e-n-tab-title >> nth=${ String( itemNumber ) }` )
			.evaluate( ( element ) => 'true' === element.getAttribute( 'aria-selected' ) );

	if ( ! isActiveTab ) {
		await clickTab( editor.getPreviewFrame(), itemNumber );
	}

	await editor.getPreviewFrame().locator( activeContainerSelector ).hover();
	const elementEditButton = await editor.getPreviewFrame()
		.locator( activeContainerSelector ).locator( '> .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
	await elementEditButton.click();
	await editor.getPreviewFrame().waitForSelector( activeContainerSelector );
	return await editor.getPreviewFrame().locator( activeContainerSelector ).getAttribute( 'data-id' );
}

export async function setBackgroundVideoUrl( page: Page, editor:EditorPage, elementId: string, videoUrl: string ) {
	await editor.selectElement( elementId );
	await editor.activatePanelTab( 'style' );
	await page.locator( '.eicon-video-camera' ).first().click();
	await page.locator( '.elementor-control-background_video_link input' ).fill( videoUrl );
}

export async function isTabTitleVisible( page: Page, context: Page | Frame, positionIndex: Number = 0 ) {
	const titleWrapperWidth = await context.locator( `.e-n-tabs-heading` ).evaluate( ( element ) => element.clientWidth ),
		itemBox = await context.locator( `.e-n-tab-title >> nth=${ positionIndex }` ).evaluate( ( element ) => {
			const elementBox = element.getBoundingClientRect();

			return {
				left: elementBox.left,
			};
		} );

	const isItemPositionToTheRightOfTitleWrapper = titleWrapperWidth < itemBox.left,
		isItemPositionToTheLeftOfTitleWrapper = 0 > ( itemBox.left );

	if ( isItemPositionToTheRightOfTitleWrapper || isItemPositionToTheLeftOfTitleWrapper ) {
		return false;
	}

	return true;
}

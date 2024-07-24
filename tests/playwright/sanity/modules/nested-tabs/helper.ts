import { type Page, type Frame, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import WpAdminPage from '../../../pages/wp-admin-page';

export async function editTab( editor: EditorPage, tabIndex: string ) {
	const tabTitleSelector = '.e-n-tabs-heading .e-n-tab-title';
	await editor.getPreviewFrame().waitForSelector( `${ tabTitleSelector }[aria-selected="true"]` );
	const tabTitle = editor.getPreviewFrame().locator( `${ tabTitleSelector }>>nth=${ tabIndex }` );
	await tabTitle.click();
	await editor.page.waitForTimeout( 100 );
	return await editor.getPreviewFrame().locator( '.e-n-tabs-content .e-con.e-active.elementor-element-edit-mode' ).getAttribute( 'data-id' );
}

// Click on tab by position.
export async function clickTab( context: Page | Frame, tabPosition: number ) {
	await context.locator( `.elementor-widget-n-tabs .e-n-tab-title >> nth=${ String( tabPosition ) }` ).first().click();
}

export async function setup( wpAdmin: WpAdminPage, customExperiment: {[ n: string ]: boolean | string } | '' = '' ) {
	let experiments = {
		container: 'active',
		'nested-elements': 'active',
	};

	experiments = { ...experiments, ...customExperiment };
	await wpAdmin.setExperiments( experiments );
}

export async function setTabItemColor(
	editor: EditorPage,
	panelClass: string,
	tabState: string,
	colorPickerClass: string,
	color: string,
) {
	await editor.openPanelTab( 'style' );
	if ( 'tabs' !== panelClass ) {
		await editor.page.locator( `.elementor-control-${ panelClass }` ).click();
	}
	await editor.page.locator( `.elementor-control-${ tabState }` ).click();
	await editor.setColorControlValue( colorPickerClass, color );
}

export async function setTabBorderColor(
	editor: EditorPage,
	state: string,
	stateExtended: string,
	color: string,
	borderWidth: string,
	borderStyle: string = 'solid',
) {
	await editor.openPanelTab( 'style' );
	await editor.openSection( 'section_tabs_style' );
	await editor.setTabControlValue( 'tabs_title_style', `tabs_title_${ state }` );
	await editor.setSelectControlValue( `tabs_title_border${ stateExtended }_border`, borderStyle );
	await editor.setDimensionsValue( `tabs_title_border${ stateExtended }_width`, borderWidth );
	await editor.setColorControlValue( `tabs_title_border${ stateExtended }_color`, color );
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
	const elementEditButton = editor.getPreviewFrame()
		.locator( activeContainerSelector ).locator( '> .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
	await elementEditButton.click();
	await editor.getPreviewFrame().waitForSelector( activeContainerSelector );
	return await editor.getPreviewFrame().locator( activeContainerSelector ).getAttribute( 'data-id' );
}

export async function setBackgroundVideoUrl( editor:EditorPage, elementId: string, videoUrl: string ) {
	await editor.selectElement( elementId );
	await editor.openPanelTab( 'style' );
	await editor.setChooseControlValue( 'background_background', 'eicon-video-camera' );
	await editor.setTextControlValue( 'background_video_link', videoUrl );
}

export async function isTabTitleVisible( context: Page | Frame, positionIndex: number = 0 ) {
	const titleWrapperWidth = await context.locator( `.e-n-tabs-heading` ).evaluate( ( element ) => element.clientWidth ),
		itemBox = await context.locator( `.e-n-tab-title >> nth=${ positionIndex }` ).evaluate( ( element ) => {
			const elementBox = element.getBoundingClientRect();

			return {
				left: elementBox.left,
			};
		} );

	const isItemPositionToTheRightOfTitleWrapper = titleWrapperWidth < itemBox.left,
		isItemPositionToTheLeftOfTitleWrapper = 0 > ( itemBox.left );

	return ! ( isItemPositionToTheRightOfTitleWrapper || isItemPositionToTheLeftOfTitleWrapper );
}

export async function deleteItemFromRepeater( editor: EditorPage, widgetID: string ) {
	// Arrange
	const deleteItemButton = editor.page.locator( '.elementor-repeater-row-tool.elementor-repeater-tool-remove .eicon-close' ),
		nestedItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tab-title` ),
		nestedItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .elementor-widget-container > .e-n-tabs > .e-n-tabs-content > .e-con` ),
		numberOfTitles = await nestedItemTitle.count(),
		numberOfContents = await nestedItemContent.count();

	// Act
	await deleteItemButton.last().click();

	await editor.getPreviewFrame().locator( `.elementor-element-${ widgetID }` ).waitFor();

	// Assert
	await expect.soft( nestedItemTitle ).toHaveCount( numberOfTitles - 1 );
	await expect.soft( nestedItemContent ).toHaveCount( numberOfContents - 1 );
}

export async function addItemFromRepeater( editor: EditorPage, widgetID: string ) {
	// Arrange
	const addItemButton = editor.page.locator( '.elementor-repeater-add' ),
		nestedItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tab-title` ),
		nestedItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } > .elementor-widget-container > .e-n-tabs > .e-n-tabs-content > .e-con` ),
		numberOfTitles = await nestedItemTitle.count(),
		numberOfContents = await nestedItemContent.count();

	// Act
	await addItemButton.click();

	await editor.getPreviewFrame().locator( `.elementor-element-${ widgetID }` ).waitFor();

	// Assert
	await expect.soft( nestedItemTitle ).toHaveCount( numberOfTitles + 1 );
	await expect.soft( nestedItemContent ).toHaveCount( numberOfContents + 1 );
}

export async function cloneItemFromRepeater( editor: EditorPage, widgetID: string, position: number ) {
	// Arrange
	const nestedItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tab-title` ),
		nestedItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tabs-content > .e-con` ),
		numberOfTitles = await nestedItemTitle.count(),
		numberOfContents = await nestedItemContent.count(),
		cloneItemButton = editor.page.locator( '.elementor-repeater-tool-duplicate' ).nth( position );

	// Act
	await cloneItemButton.click();
	await editor.getPreviewFrame().locator( `.elementor-element-${ widgetID }` ).waitFor();

	const currentTitle = nestedItemTitle.nth( position ),
		currentTitleId = await currentTitle.getAttribute( 'id' ),
		currentTitleIndex = await currentTitle.getAttribute( 'data-tab-index' ),
		currentTitleText = await currentTitle.locator( '.e-n-tab-title-text' ).innerText(),
		currentContainerId = await nestedItemContent.nth( position ).getAttribute( 'id' ),
		currentContainerAriaLabeledBy = await nestedItemContent.nth( position ).getAttribute( 'aria-labelledby' );

	const clonedItem = nestedItemTitle.nth( position + 1 ),
		clonedTitleId = await clonedItem.getAttribute( 'id' ),
		clonedTitleIndex = await clonedItem.getAttribute( 'data-tab-index' ),
		clonedTitleText = await clonedItem.locator( '.e-n-tab-title-text' ).innerText(),
		clonedContainerId = await nestedItemContent.nth( position + 1 ).getAttribute( 'id' ),
		clonedContainerAriaLabeledBy = await nestedItemContent.nth( position + 1 ).getAttribute( 'aria-labelledby' );

	// Assert
	await expect( nestedItemTitle ).toHaveCount( numberOfTitles + 1 );
	await expect( nestedItemContent ).toHaveCount( numberOfContents + 1 );

	expect( currentTitleId ).not.toEqual( clonedTitleId );
	expect( parseInt( clonedTitleIndex ) ).toEqual( parseInt( currentTitleIndex ) + 1 );
	expect( currentTitleText ).toEqual( clonedTitleText );
	expect( currentContainerId ).not.toEqual( clonedContainerId );
	expect( currentContainerAriaLabeledBy ).not.toEqual( clonedContainerAriaLabeledBy );
	expect( currentTitleId ).toEqual( currentContainerAriaLabeledBy );
	expect( clonedTitleId ).toEqual( clonedContainerAriaLabeledBy );
}

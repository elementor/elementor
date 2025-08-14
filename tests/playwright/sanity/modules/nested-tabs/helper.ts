import { type Page, type Frame, expect } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';
import _path from 'path';

export const locators = {
	tabTitle: '.e-n-tabs-heading .e-n-tab-title',
	selectedTabTitle: '.e-n-tabs-heading .e-n-tab-title[aria-selected="true"]',
	activeTab: '.e-n-tabs-content .e-con.e-active.elementor-element-edit-mode',
	repeaterAddButton: '.elementor-repeater-add',
	repeaterDeleteButton: '.elementor-repeater-row-tool.elementor-repeater-tool-remove .eicon-close',
	repeaterCloneButton: '.elementor-repeater-tool-duplicate',
};

export const templatePath = _path.resolve( __dirname, '../../../templates/nested-tabs-with-icons.json' );

export async function editTab( editor: EditorPage, tabIndex: number ): Promise<string> {
	await editor.getPreviewFrame().locator( `${ locators.tabTitle }[aria-selected="true"]` ).waitFor();
	await editor.getPreviewFrame().locator( locators.tabTitle ).nth( tabIndex ).click();
	return await editor.getPreviewFrame().locator( locators.activeTab ).getAttribute( 'data-id' );
}

export async function clickTabByPosition( context: Page | Frame, tabPosition: number ): Promise<void> {
	await context.locator( locators.tabTitle ).nth( tabPosition ).first().click();
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
		activeContainerSelector = `${ widgetSelector } .e-n-tabs-content > .e-con`,
		isActiveTab = await editor.getPreviewFrame()
			.locator( `${ widgetSelector }.e-n-tab-title >> nth=${ String( itemNumber ) }` )
			.evaluate( ( element ) => 'true' === element.getAttribute( 'aria-selected' ) );

	if ( ! isActiveTab ) {
		await clickTabByPosition( editor.getPreviewFrame(), itemNumber );
	}

	await editor.getPreviewFrame().locator( activeContainerSelector ).nth( itemNumber ).hover();
	const elementEditButton = editor.getPreviewFrame()
		.locator( activeContainerSelector ).nth( itemNumber ).locator( '> .elementor-element-overlay > .elementor-editor-element-settings > .elementor-editor-element-edit' );
	await elementEditButton.click();
	await editor.getPreviewFrame().locator( activeContainerSelector ).nth( itemNumber ).waitFor();
	return editor.getPreviewFrame().locator( activeContainerSelector ).nth( itemNumber ).getAttribute( 'data-id' );
}

export async function setBackgroundVideoUrl( editor:EditorPage, elementId: string, videoUrl: string ) {
	await editor.selectElement( elementId );
	await editor.openPanelTab( 'style' );
	await editor.setChooseControlValue( 'background_background', 'eicon-video-camera' );
	await editor.setTextControlValue( 'background_video_link', videoUrl );
}

export async function isTabTitleVisible( context: Page | Frame, positionIndex: number = 0 ): Promise <boolean> {
	const titleWrapperWidth = await context.locator( `.e-n-tabs-heading` ).evaluate( ( el ) => el.clientWidth );
	const itemBox = await context.locator( `${ locators.tabTitle } >> nth=${ positionIndex }` )
		.evaluate( ( el ) => el.getBoundingClientRect().left );
	return itemBox >= 0 && itemBox <= titleWrapperWidth;
}

export async function deleteItemFromRepeater( editor: EditorPage, widgetID: string ): Promise<void> {
	const nestedItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tab-title` );
	const nestedItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tabs-content > .e-con` );
	const initialCount = await nestedItemTitle.count();

	await editor.page.locator( locators.repeaterDeleteButton ).last().click();
	await editor.getPreviewFrame().locator( `.elementor-element-${ widgetID }` ).waitFor();

	await expect.soft( nestedItemTitle ).toHaveCount( initialCount - 1 );
	await expect.soft( nestedItemContent ).toHaveCount( initialCount - 1 );
}

export async function addItemFromRepeater( editor: EditorPage, widgetID: string ) {
	// Arrange
	const addItemButton = editor.page.locator( locators.repeaterAddButton ),
		nestedItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } .e-n-tab-title` ),
		nestedItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ widgetID } > .e-n-tabs > .e-n-tabs-content > .e-con` ),
		numberOfTitles = await nestedItemTitle.count(),
		numberOfContents = await nestedItemContent.count();

	// Act
	await addItemButton.click( { force: true } );

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
		cloneItemButton = editor.page.locator( locators.repeaterCloneButton ).nth( position );

	await cloneItemButton.click( { force: true } );
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

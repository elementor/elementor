import { expect, Locator, Page } from '@playwright/test';
import EditorPage from '../../../pages/editor-page';

/**
 * Set nested accordion title tag (H1-H6,div,span,p).
 *
 * @param {string}     optionToSelect          - value of select option i.e. h1,h2,h3,h4,h5,h6,div,span,p
 * @param {string}     nestedAccordionWidgetId - Id of the nested accordion widget
 * @param {EditorPage} editor                  - Editor object
 *
 * @return {Promise<void>}
 */
export async function setTitleTextTag( optionToSelect: string, nestedAccordionWidgetId: string, editor: EditorPage ): Promise<void> {
	const frame = editor.getPreviewFrame();
	await editor.selectElement( nestedAccordionWidgetId );
	await editor.setSelectControlValue( 'title_tag', optionToSelect );
	await frame.waitForLoadState( 'load' );
}

/**
 * Take a screenshot of this widget.
 *
 * @param {string}  fileName
 * @param {Locator} locator
 *
 * @return {Promise<void>}
 */
export async function expectScreenshotToMatchLocator( fileName: string, locator: Locator ): Promise<void> {
	expect.soft( await locator.screenshot( {
		type: 'png',
	} ) ).toMatchSnapshot( fileName );
}

/**
 * Set nested accordion title icon position.
 *
 * @param {string}     direction  - Icon direction
 * @param {EditorPage} editor     - Editor object
 * @param {string}     breakpoint - Breakpoint type
 *
 * @return {Promise<void>}
 */
export async function setTitleIconPosition( direction: string, editor: EditorPage, breakpoint: string = 'desktop' ): Promise<void> {
	const controlBreakpoint = ( breakpoint.toLowerCase() !== 'desktop' ) ? `_${ breakpoint }` : '';
	const icon = Object.freeze( {
		right: '.eicon-h-align-right',
		left: '.eicon-h-align-left',
	} );
	await editor.page.locator( `.elementor-control-accordion_item_title_icon_position${ controlBreakpoint } ${ icon[ direction ] }` ).click();
}

/**
 * Set nested accordion title horizontal alignment.
 *
 * @param {string}     direction  - Icon direction
 * @param {EditorPage} editor     - Editor object
 * @param {string}     breakpoint - Breakpoint type
 *
 * @return {Promise<void>}
 */
export async function setTitleHorizontalAlignment( direction: string, editor: EditorPage, breakpoint: string = 'desktop' ): Promise<void> {
	const controlBreakpoint = ( breakpoint.toLowerCase() !== 'desktop' ) ? `_${ breakpoint }` : '';
	const icon = Object.freeze( {
		start: '.eicon-align-start-h',
		end: '.eicon-align-end-h',
		center: '.eicon-h-align-center',
		stretch: '.eicon-h-align-stretch',
		justify: '.eicon-h-align-stretch',
	} );
	await editor.page.locator( `.elementor-control-accordion_item_title_position_horizontal${ controlBreakpoint } ${ icon[ direction ] }` ).click();
}

export async function setBorderAndBackground( editor: EditorPage, state: string, color: string, borderType: string, borderColor: string ): Promise<void> {
	await setState();
	await setBackgroundColor();
	await setBorderType();
	await setBorderWidth();
	await setBorderColor();

	async function setBackgroundColor() {
		await editor.setChooseControlValue( `accordion_background_${ state }_background`, 'eicon-paint-brush' );
		await editor.setColorControlValue( `accordion_background_${ state }_color`, color );
	}

	async function setBorderType() {
		await editor.setSelectControlValue( 'accordion_border_' + state + '_border', borderType );
	}

	async function setBorderWidth() {
		await editor.setDimensionsValue( `accordion_border_${ state }_width`, '5' );
	}

	async function setBorderColor() {
		await editor.setColorControlValue( `accordion_border_${ state }_color`, borderColor );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-accordion_' + state + '_border_and_background' );
	}
}

export async function setIconColor( editor: EditorPage, state: string, color: string, context: string ): Promise<void> {
	await setState();
	await setColor();

	async function setColor() {
		await editor.setColorControlValue( `${ state }_${ context }_color`, color );
	}

	async function setState() {
		await editor.page.click( '.elementor-control-header_' + state + '_' + context );
	}
}

export async function addIcon( editor: EditorPage, page: Page, iconName: string ): Promise<void> {
	await editor.openPanelTab( 'content' );
	await page.locator( '.elementor-control-icons--inline__displayed-icon' ).first().click();
	await page.locator( '#elementor-icons-manager__search input' ).fill( iconName );
	await page.locator( '.elementor-icons-manager__tab__item' ).first().click();
	await page.locator( '.dialog-insert_icon' ).click();
}

export async function setIconSize( editor: EditorPage, sizeInPx: string = '10' ): Promise<void> {
	await editor.openPanelTab( 'style' );
	await editor.openSection( 'section_header_style' );
	await editor.setSliderControlValue( 'icon_size', sizeInPx );
}

export async function deleteItemFromRepeater( editor: EditorPage, accordionID: string ): Promise<void> {
	// Arrange
	const deleteItemButton = editor.page.locator( '.elementor-repeater-row-tool.elementor-repeater-tool-remove .eicon-close' ),
		nestedAccordionItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ accordionID } .e-n-accordion-item` ),
		nestedAccordionItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ accordionID } .e-n-accordion-item .e-con` ),
		numberOfTitles = await nestedAccordionItemTitle.count(),
		numberOfContents = await nestedAccordionItemContent.count();

	// Act
	await deleteItemButton.nth( 1 ).click();

	await editor.getPreviewFrame().waitForSelector( `.elementor-element-${ accordionID }` );

	// Assert
	await expect.soft( nestedAccordionItemTitle ).toHaveCount( numberOfTitles - 1 );
	await expect.soft( nestedAccordionItemContent ).toHaveCount( numberOfContents - 1 );
}

export async function addItemFromRepeater( editor: EditorPage, accordionID: string ): Promise<void> {
	// Arrange
	const addItemButton = editor.page.locator( '.elementor-repeater-add' ),
		nestedAccordionItemTitle = editor.getPreviewFrame().locator( `.elementor-element-${ accordionID } .e-n-accordion-item` ),
		nestedAccordionItemContent = editor.getPreviewFrame().locator( `.elementor-element-${ accordionID } .e-n-accordion-item .e-con` ),
		numberOfTitles = await nestedAccordionItemTitle.count(),
		numberOfContents = await nestedAccordionItemContent.count();

	// Act
	await addItemButton.click();

	await editor.getPreviewFrame().waitForSelector( `.elementor-element-${ accordionID }` );

	// Assert
	await expect.soft( nestedAccordionItemTitle ).toHaveCount( numberOfTitles + 1 );
	await expect.soft( nestedAccordionItemContent ).toHaveCount( numberOfContents + 1 );
}

export async function cloneItemFromRepeater( editor: EditorPage, position: string ): Promise<void> {
	// Arrange
	const nestedAccordionItemTitle = editor.getPreviewFrame().locator( `.e-n-accordion-item` ),
		nestedAccordionItemContent = editor.getPreviewFrame().locator( `.e-n-accordion-item > .e-con` ),
		numberOfTitles = await nestedAccordionItemTitle.count(),
		numberOfContents = await nestedAccordionItemContent.count(),
		lastItemIndex = numberOfTitles - 1,
		index = 'last' === position ? lastItemIndex : 0;

	const currentTitle = nestedAccordionItemTitle.nth( index ),
		currentTitleId = await currentTitle.getAttribute( 'id' ),
		currentTitleIndex = await currentTitle.locator( 'summary' ).getAttribute( 'data-accordion-index' ),
		currentTitleText = await currentTitle.locator( '.e-n-accordion-item-title-text' ).innerText(),
		currentContainerId = await currentTitle.locator( '.e-con' ).nth( 0 ).getAttribute( 'data-id' ),
		currentContainerAriaLabeledBy = await currentTitle.locator( '.e-con' ).nth( 0 ).getAttribute( 'aria-labelledby' ),
		currentContainerWidgetTitle = await currentTitle.getByText( 'Add Your' ).textContent();

	const cloneItemButton = editor.page.getByRole( 'button', { name: 'Duplicate' } ).nth( index );

	// Act
	await nestedAccordionItemTitle.nth( 0 ).locator( 'summary' ).click();
	await cloneItemButton.click();

	const clonedTitle = nestedAccordionItemTitle.nth( index + 1 ),
		clonedTitleId = await clonedTitle.getAttribute( 'id' ),
		clonedTitleIndex = await clonedTitle.locator( 'summary' ).getAttribute( 'data-accordion-index' ),
		clonedTitleText = await clonedTitle.locator( '.e-n-accordion-item-title-text' ).innerText(),
		clonedContainerId = await clonedTitle.locator( '.e-con' ).nth( 0 ).getAttribute( 'data-id' ),
		clonedContainerAriaLabeledBy = await clonedTitle.locator( '.e-con' ).nth( 0 ).getAttribute( 'aria-labelledby' ),
		clonedContainerWidgetTitle = await clonedTitle.getByText( 'Add Your' ).textContent();

	await editor.getPreviewFrame().locator( `.e-n-accordion` ).waitFor();

	// Assert
	await expect( nestedAccordionItemTitle ).toHaveCount( numberOfTitles + 1 );
	await expect( nestedAccordionItemContent ).toHaveCount( numberOfContents + 1 );

	expect( currentTitleId ).not.toEqual( clonedTitleId );
	expect( parseInt( clonedTitleIndex ) ).toEqual( parseInt( currentTitleIndex ) + 1 );
	expect( currentTitleText ).toEqual( clonedTitleText );
	expect( currentContainerId ).not.toEqual( clonedContainerId );
	expect( currentContainerAriaLabeledBy ).not.toEqual( clonedContainerAriaLabeledBy );
	expect( currentContainerWidgetTitle ).toEqual( clonedContainerWidgetTitle );
	expect( currentTitleId ).toEqual( currentContainerAriaLabeledBy );
	expect( clonedTitleId ).toEqual( clonedContainerAriaLabeledBy );

	if ( 'last' !== position ) {
		const nextTitle = nestedAccordionItemTitle.nth( index + 2 ),
			nextTitleIndex = await nextTitle.locator( 'summary' ).getAttribute( 'data-accordion-index' );

		expect( parseInt( nextTitleIndex ) ).toEqual( parseInt( currentTitleIndex ) + 2 );
		expect( parseInt( nextTitleIndex ) ).toEqual( parseInt( clonedTitleIndex ) + 1 );
	}
}

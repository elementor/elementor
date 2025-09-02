import { type Page } from '@playwright/test';
import { canvasPageFrameLocator } from 'playwright';

export const getControl = async ( page: Page, styleSectionSelector: string, controlToAccessFrom: string ) => {
	await canvasPageFrameLocator( page ).getByText( 'This is a title' ).click();
	await page.getByRole( 'tab', { name: 'Style' } ).click();
	if ( await page.locator( `#${ controlToAccessFrom }-control` ).isHidden() ) {
		await page.getByRole( 'button', { name: styleSectionSelector } ).click();
	}
	return page.locator( `#${ controlToAccessFrom }-control` );
};

export const openVariablesPopover = async ( page: Page, styleSectionSelector: string, controlToAccessFrom: string ) => {
	const control = await getControl( page, styleSectionSelector, controlToAccessFrom );
	const controlBoundingBox = await control.boundingBox();
	await page.mouse.move( controlBoundingBox.x + ( controlBoundingBox.width / 2 ), controlBoundingBox.y + ( controlBoundingBox.height / 2 ) );
	await page.click( '#floating-action-bar' );
	return control;
};

export const addVariable = async ( page: Page, variable: { name: string, value: string, type: 'font' | 'color' }, styleSectionSelector: string, controlToAccessFrom: string ) => {
	await openVariablesPopover( page, styleSectionSelector, controlToAccessFrom );
	await page.click( '#add-variable-button' );
	await page.getByRole( 'textbox', { name: 'Name' } ).fill( variable.name );
	if ( 'font' === variable.type ) {
		await page.locator( '#variable-value-wrapper' ).getByRole( 'button' ).click();
		await page.locator( `#${ controlToAccessFrom }-variables-selector-search` ).fill( variable.value );
		await page.locator( `#${ controlToAccessFrom }-variables-selector` ).getByText( variable.value ).click();
	} else if ( 'color' === variable.type ) {
		await page.locator( '#variable-value-wrapper' ).getByRole( 'textbox' ).fill( variable.value );
	}
	await page.locator( '#create-variable-button' ).click();
	await page.getByRole( 'button', { name: variable.name } ).waitFor();
};

export const detachVariable = async ( page: Page, styleSectionSelector: string, controlLabelToDetach: string, variableName: string ) => {
	await canvasPageFrameLocator( page ).getByText( 'This is a title' ).click();
	await page.getByRole( 'tab', { name: 'Style' } ).click();
	if ( await page.getByText( controlLabelToDetach ).isHidden() ) {
		await page.getByRole( 'button', { name: styleSectionSelector } ).click();
	}
	const variableButton = page.getByRole( 'button', { name: variableName } );
	const variableButtonBoundingBox = await variableButton.boundingBox();
	await page.mouse.move( variableButtonBoundingBox.x + ( variableButtonBoundingBox.width / 2 ), variableButtonBoundingBox.y + ( variableButtonBoundingBox.height / 2 ) );
	const unlinkButton = page.getByRole( 'button', { name: 'Unlink' } );
	await unlinkButton.click();
};

export const openVariableManager = async ( page: Page, styleSectionSelector: string, controlToAccessFrom: string ) => {
	await openVariablesPopover( page, styleSectionSelector, controlToAccessFrom );
	await page.click( '#variables-manager-button' );
};

import { type Page } from '@playwright/test';
import EditorSelectors from '../../../../selectors/editor-selectors';
import WpAdminPage from '../../../../pages/wp-admin-page';

export const initTemplate = async ( page: Page ) => {
	const adminPage = new WpAdminPage( page );
	await adminPage.setExperiments( { e_variables_manager: 'active' } );
	const editorPage = await adminPage.openNewPage( false, false );
	await editorPage.loadTemplate( 'tests/playwright/templates/default-v4.json' );
};

export const addFontVariable = async ( page: Page ) => {
	const variableData = { name: `test-font-variable-${ Date.now() }`, value: 'Arial', type: 'font' as const };
	await addVariable( page, variableData, 'Typography', 'font-family' );
	await detachVariable( page, 'Typography', 'Font Family', variableData.name );
	return variableData;
};

export const addColorVariable = async ( page: Page ) => {
	const variableData = { name: `test-color-variable-${ Date.now() }`, value: '#ff0000', type: 'color' as const };
	await addVariable( page, variableData, 'Typography', 'text-color' );
	await detachVariable( page, 'Typography', 'Text Color', variableData.name );
	return variableData;
};

export const getControl = async ( page: Page, styleSectionSelector: string, controlToAccessFrom: string ) => {
	await page.frameLocator( EditorSelectors.canvas ).locator( 'body' ).getByText( 'This is a title' ).click();
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
	await page.frameLocator( EditorSelectors.canvas ).locator( 'body' ).getByText( 'This is a title' ).click();
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

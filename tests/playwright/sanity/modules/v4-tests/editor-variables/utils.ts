import { TestInfo, type Page } from '@playwright/test';
import EditorSelectors from '../../../../selectors/editor-selectors';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';

export const initTemplate = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdminPage.setExperiments( { e_variables: 'active', e_atomic_elements: 'active' } );
	await wpAdminPage.setExperiments( { e_variables_manager: 'active' } );
	const editorPage = await wpAdminPage.openNewPage();
	await editorPage.loadTemplate( 'tests/playwright/sanity/modules/v4-tests/editor-variables/variables-manager-template.json' );
	return wpAdminPage;
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
	await page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
	return control;
};

export const addVariable = async ( page: Page, variable: { name: string, value: string, type: 'font' | 'color' }, styleSectionSelector: string, controlToAccessFrom: string ) => {
	await openVariablesPopover( page, styleSectionSelector, controlToAccessFrom );
	await page.click( EditorSelectors.variables.manager.addButton );
	await page.getByRole( 'textbox', { name: 'Name' } ).fill( variable.name );
	if ( 'font' === variable.type ) {
		await page.locator( EditorSelectors.variables.manager.valueInputWrapper ).getByRole( 'button' ).click();
		await page.locator( `#${ controlToAccessFrom }-variables-selector-search` ).fill( variable.value );
		await page.locator( `#${ controlToAccessFrom }-variables-selector` ).getByText( variable.value ).click();
	} else if ( 'color' === variable.type ) {
		await page.locator( EditorSelectors.variables.manager.valueInputWrapper ).getByRole( 'textbox' ).fill( variable.value );
	}
	await page.locator( EditorSelectors.variables.manager.createButton ).click();
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
	if ( await page.getByText( 'Variable Manager' ).isVisible() ) {
		return;
	}
	await page.locator( 'header' ).getByRole( 'button', { name: 'Add Element' } ).click();
	await openVariablesPopover( page, styleSectionSelector, controlToAccessFrom );
	await page.click( EditorSelectors.variables.manager.managerButton );
};

export const createVariableFromManager = async ( page: Page, type: 'font' | 'color' ) => {
	await openVariableManager( page, 'Typography', 'text-color' );

	await page.getByRole( 'button', { name: 'Add variable' } ).click();
	await page.locator( 'li' ).filter( { hasText: type } ).click();
};

export const deleteVariable = async ( page: Page, variableName: string ) => {
	await openVariableManager( page, 'Typography', 'text-color' );
	const variableLocator = page.locator( 'tr', { hasText: variableName } );
	await variableLocator.hover();
	await variableLocator.getByRole( 'toolbar' ).click();
	await page.getByRole( 'menuitem', { name: 'Delete', includeHidden: true } ).click();
	await page.getByRole( 'button', { name: 'Delete' } ).click();
};

export const saveAndExitVariableManager = async ( page: Page, shouldSave: boolean ) => {
	if ( shouldSave ) {
		await page.locator( '#elementor-panel' ).getByRole( 'button', { name: /Save/ } ).click();
		await page.waitForRequest( ( response ) => response.url().includes( 'list' ) && null === response.failure() );
	}
	await page.locator( '#elementor-panel' ).getByRole( 'button', { name: 'Close' } ).click();
};

export const deleteAllVariables = async ( page: Page ) => {
	await openVariableManager( page, 'Typography', 'text-color' );

	const testVariableRows = page.locator( 'tbody tr' ).filter( { hasText: /test-.*-variable/i } );
	const rowCount = await testVariableRows.count();

	for ( let i = rowCount - 1; i >= 0; i-- ) {
		const variableName = await testVariableRows.nth( i ).getByText( /test-.*-variable/i ).textContent();

		if ( variableName ) {
			await deleteVariable( page, variableName );
		}
	}

	await saveAndExitVariableManager( page, rowCount > 0 );
};


import { type Page } from '@playwright/test';
import EditorSelectors from '../../../../selectors/editor-selectors';

export default class VariablesManagerPage {
	private readonly page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	async addFontVariable() {
		const variableData = { name: `test-font-variable-${ Date.now() }`, value: 'Arial', type: 'font' as const };
		await this.addVariable( variableData, 'Typography', 'font-family' );
		await this.detachVariable( 'Typography', 'Font Family', variableData.name );
		return variableData;
	}

	async addColorVariable() {
		const variableData = { name: `test-color-variable-${ Date.now() }`, value: '#ff0000', type: 'color' as const };
		await this.addVariable( variableData, 'Typography', 'text-color' );
		await this.detachVariable( 'Typography', 'Text Color', variableData.name );
		return variableData;
	}

	private async getControl( styleSectionSelector: string, controlToAccessFrom: string ) {
		await this.page.frameLocator( EditorSelectors.canvas ).locator( 'body' ).getByText( 'This is a title' ).click();
		await this.page.getByRole( 'tab', { name: 'Style' } ).click();
		if ( await this.page.locator( `#${ controlToAccessFrom }-control` ).isHidden() ) {
			await this.page.getByRole( 'button', { name: styleSectionSelector } ).click();
		}
		return this.page.locator( `#${ controlToAccessFrom }-control` );
	}

	private async openVariablesPopover( styleSectionSelector: string, controlToAccessFrom: string ) {
		const control = await this.getControl( styleSectionSelector, controlToAccessFrom );
		const controlBoundingBox = await control.boundingBox();
		await this.page.mouse.move( controlBoundingBox.x + ( controlBoundingBox.width / 2 ), controlBoundingBox.y + ( controlBoundingBox.height / 2 ) );
		await this.page.click( EditorSelectors.floatingElements.v4.floatingActionsBar );
		return control;
	}

	private async addVariable( variable: { name: string, value: string, type: 'font' | 'color' }, styleSectionSelector: string, controlToAccessFrom: string ) {
		await this.openVariablesPopover( styleSectionSelector, controlToAccessFrom );
		await this.page.click( EditorSelectors.variables.manager.addButton );
		await this.page.getByRole( 'textbox', { name: 'Name' } ).fill( variable.name );
		if ( 'font' === variable.type ) {
			await this.page.locator( EditorSelectors.variables.manager.valueInputWrapper ).getByRole( 'button' ).click();
			await this.page.locator( `#${ controlToAccessFrom }-variables-selector-search` ).fill( variable.value );
			await this.page.locator( `#${ controlToAccessFrom }-variables-selector` ).getByText( variable.value ).click();
		} else if ( 'color' === variable.type ) {
			await this.page.locator( EditorSelectors.variables.manager.valueInputWrapper ).getByRole( 'textbox' ).fill( variable.value );
		}
		await this.page.locator( EditorSelectors.variables.manager.createButton ).click();
		await this.page.getByRole( 'button', { name: variable.name } ).waitFor();
	}

	async detachVariable( styleSectionSelector: string, controlLabelToDetach: string, variableName: string ) {
		await this.page.frameLocator( EditorSelectors.canvas ).locator( 'body' ).getByText( 'This is a title' ).click();
		await this.page.getByRole( 'tab', { name: 'Style' } ).click();
		if ( await this.page.getByText( controlLabelToDetach ).isHidden() ) {
			await this.page.getByRole( 'button', { name: styleSectionSelector } ).click();
		}
		const variableButton = this.page.getByRole( 'button', { name: variableName } );
		const variableButtonBoundingBox = await variableButton.boundingBox();
		await this.page.mouse.move( variableButtonBoundingBox.x + ( variableButtonBoundingBox.width / 2 ), variableButtonBoundingBox.y + ( variableButtonBoundingBox.height / 2 ) );
		const unlinkButton = this.page.getByRole( 'button', { name: 'Unlink' } );
		await unlinkButton.click();
	}

	async openVariableManager( styleSectionSelector: string, controlToAccessFrom: string ) {
		if ( await this.page.getByText( 'Variables Manager' ).isVisible() ) {
			return;
		}
		await this.page.locator( 'header' ).getByRole( 'button', { name: 'Add Element' } ).click();
		await this.openVariablesPopover( styleSectionSelector, controlToAccessFrom );
		await this.page.click( EditorSelectors.variables.manager.managerButton );
	}

	async createVariableFromManager( type: 'font' | 'color' ) {
		await this.openVariableManager( 'Typography', 'text-color' );

		await this.page.getByRole( 'button', { name: 'Add variable' } ).click();
		await this.page.locator( 'li' ).filter( { hasText: type } ).click();
	}

	async deleteVariable( variableName: string ) {
		await this.openVariableManager( 'Typography', 'text-color' );
		const variableLocator = this.page.locator( 'tr', { hasText: variableName } );
		await variableLocator.hover();
		await variableLocator.getByRole( 'toolbar' ).click();
		await this.page.getByRole( 'menuitem', { name: 'Delete', includeHidden: true } ).click();
		await this.page.getByRole( 'button', { name: 'Delete' } ).click();
	}

	async saveAndExitVariableManager( shouldSave: boolean ) {
		const isSaveEnabled = await this.page.locator( '#elementor-panel' ).getByRole( 'button', { name: /Save/ } ).isEnabled();
		if ( shouldSave || isSaveEnabled ) {
			await this.page.locator( '#elementor-panel' ).getByRole( 'button', { name: /Save/ } ).click();
			await this.page.waitForRequest( ( response ) => response.url().includes( 'list' ) && null === response.failure() );
		}
		await this.page.locator( '#elementor-panel' ).getByRole( 'button', { name: 'Close' } ).click();
		if ( await this.page.locator( '#save-changes-dialog' ).isVisible() ) {
			await this.page.locator( '[aria-labelledby="save-changes-dialog"]' ).getByRole( 'button', { name: /Save/ } ).click();
		}
	}

	async deleteAllVariables() {
		await this.openVariableManager( 'Typography', 'text-color' );

		const testVariableRows = this.page.locator( 'tbody tr' ).filter( { hasText: /test-.*-variable/i } );
		const rowCount = await testVariableRows.count();

		for ( let i = rowCount - 1; i >= 0; i-- ) {
			const variableName = await testVariableRows.nth( i ).getByText( /test-.*-variable/i ).textContent();

			if ( variableName ) {
				await this.deleteVariable( variableName );
			}
		}

		await this.saveAndExitVariableManager( rowCount > 0 );
	}
}


import { type Page } from '@playwright/test';
import EditorSelectors from '../../../../selectors/editor-selectors';

export default class VariablesManagerPage {
	private readonly page: Page;

	constructor( page: Page ) {
		this.page = page;
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

	async createVariableFromManager( { name, value, type }: { name: string, value: string, type: 'font' | 'color' } ) {
		await this.openVariableManager( 'Typography', 'text-color' );

		await this.page.getByRole( 'button', { name: 'Add variable' } ).click();
		await this.page.locator( 'li' ).filter( { hasText: type } ).click();

		const rows = this.page.locator( 'tbody tr' );
		const rowCount = await rows.count();
		const latestRow = rows.nth( rowCount - 1 );

		await latestRow.getByRole( 'textbox', { name: 'Name' } ).fill( name );
		await this.page.keyboard.press( 'Enter' );
		await latestRow.getByRole( 'button' ).nth( 2 ).dblclick();
		if ( 'color' === type ) {
			await latestRow.locator( '#color-variable-field' ).getByRole( 'textbox' ).fill( value );
		}
		if ( 'font' === type ) {
			await latestRow.getByRole( 'button' ).nth( 2 ).click();
			await this.page.locator( `#font-family-variables-selector-search` ).fill( value );
			await this.page.locator( `#font-family-variables-selector` ).getByText( value ).click();
		}
		await this.page.keyboard.press( 'Enter' );

		await this.saveVariablesManager( true );

		return latestRow;
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
		await this.saveVariablesManager( shouldSave );
		await this.page.locator( '#elementor-panel' ).getByRole( 'button', { name: 'Close' } ).click();
		if ( await this.page.locator( '#save-changes-dialog' ).isVisible() ) {
			const saveChangesDialog = this.page.locator( '[aria-labelledby="save-changes-dialog"]' );
			await saveChangesDialog.getByRole( 'button', { name: /Save/ } ).click();
			await this.page.waitForRequest( ( response ) => response.url().includes( 'list' ) && null === response.failure() );
			await saveChangesDialog.waitFor( { state: 'hidden' } );
		}
	}

	private async saveVariablesManager( shouldSave: boolean ) {
		const isSaveEnabled = await this.page.locator( '#elementor-panel' ).getByRole( 'button', { name: /Save/ } ).isEnabled();
		if ( shouldSave || isSaveEnabled ) {
			await this.page.locator( '#elementor-panel' ).getByRole( 'button', { name: /Save/ } ).click();
			await this.page.waitForRequest( ( response ) => response.url().includes( 'list' ) && null === response.failure() );
		}
	}

	async deleteAllVariables() {
		await this.openVariableManager( 'Typography', 'text-color' );

		const testVariableRows = this.page.locator( 'tbody tr' );
		const rowCount = await testVariableRows.count();

		for ( let i = rowCount - 1; i >= 0; i-- ) {
			const variableName = await testVariableRows.nth( i ).textContent();

			if ( variableName ) {
				await this.deleteVariable( variableName );
			}
		}

		await this.saveAndExitVariableManager( rowCount > 0 );
	}
}


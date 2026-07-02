import { type Page } from '@playwright/test';
import DesignSystemPage from '../design-system/design-system-page';

export default class VariablesManagerPage {
	private readonly page: Page;
	private readonly designSystem: DesignSystemPage;

	constructor( page: Page ) {
		this.page = page;
		this.designSystem = new DesignSystemPage( page );
	}

	async openVariableManager() {
		await this.designSystem.openFromToolbar();

		const isVariablesTabSelected = await this.designSystem.variablesTab
			.getAttribute( 'aria-selected' )
			.then( ( v ) => 'true' === v )
			.catch( () => false );

		if ( ! isVariablesTabSelected ) {
			await this.designSystem.switchToVariablesTab();
		}
	}

	async createVariableFromManager( { name, value, type }: { name: string, value: string, type: 'font' | 'color' } ) {
		await this.openVariableManager();

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
			await this.page.locator( '#font-family-variables-selector-search' ).fill( value );
			await this.page.locator( '#font-family-variables-selector' ).getByText( value ).click();
		}

		await this.page.keyboard.press( 'Enter' );
		await this.saveVariablesManager();

		return latestRow;
	}

	private async saveVariablesManager() {
		const saveButton = this.designSystem.panel.getByRole( 'button', { name: /Save/ } );
		const isSaveEnabled = await saveButton.isEnabled();

		if ( isSaveEnabled ) {
			await saveButton.click();
			await this.page.waitForRequest( ( response ) => response.url().includes( 'list' ) && null === response.failure() );
		}
	}
}

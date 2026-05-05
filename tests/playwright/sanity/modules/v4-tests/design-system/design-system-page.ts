import { expect, type Locator, type Page } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';
import { dismissClassManagerIntro } from '../global-classes/utils';

export default class DesignSystemPage {
	private readonly page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	get toolbarButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Design System' } );
	}

	get panel(): Locator {
		return this.page.locator( '#elementor-panel' );
	}

	get panelHeading(): Locator {
		return this.panel.getByRole( 'heading', { level: 2, name: 'Design system' } );
	}

	get closeButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Close' } );
	}

	get variablesTab(): Locator {
		return this.panel.getByRole( 'tab', { name: 'Variables' } );
	}

	get classesTab(): Locator {
		return this.panel.getByRole( 'tab', { name: 'Classes' } );
	}

	get addVariableButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Add variable' } );
	}

	get variablesEmptyState(): Locator {
		return this.panel.getByText( 'Create your first variable' );
	}

	get variablesSearchInput(): Locator {
		return this.panel.getByPlaceholder( 'Search' );
	}

	get classesSaveButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Save changes' } );
	}

	async openFromToolbar(): Promise< void > {
		await this.toolbarButton.click();
		await this.panelHeading.waitFor( { state: 'visible' } );
	}

	async closePanel(): Promise< void > {
		await this.closeButton.click();
		await this.panelHeading.waitFor( { state: 'hidden' } );
	}

	async switchToVariablesTab(): Promise< void > {
		await this.variablesTab.click();
		await this.addVariableButton.waitFor( { state: 'visible' } );
	}

	async switchToClassesTab(): Promise< void > {
		await this.classesTab.click();
		await dismissClassManagerIntro( this.page );
		await expect( this.classesTab ).toHaveAttribute( 'aria-selected', 'true' );
	}

	async openFromClassManagerButton( editor: EditorPage, elementId: string ): Promise< void > {
		await editor.selectElement( elementId );
		await editor.v4Panel.openTab( 'style' );
		await this.page.getByRole( 'button', { name: 'Class Manager' } ).click();
		await this.dismissUnsavedChangesDialogIfVisible();
		await dismissClassManagerIntro( this.page );
		await this.panelHeading.waitFor( { state: 'visible' } );
	}

	async dismissUnsavedChangesDialogIfVisible(): Promise< void > {
		const dialog = this.page.getByRole( 'dialog', { name: 'You have unsaved changes' } );
		const saveAndContinue = dialog.getByRole( 'button', { name: 'Save & Continue' } );

		if ( await saveAndContinue.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			await saveAndContinue.click();
		}
	}
}

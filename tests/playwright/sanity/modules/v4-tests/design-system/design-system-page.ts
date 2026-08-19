import { expect, type Download, type Locator, type Page } from '@playwright/test';
import * as path from 'path';
import EditorPage from '../../../../pages/editor-page';
import { dismissClassManagerIntro } from '../global-classes/utils';

export type ConflictStrategy = 'keep' | 'replace';

export default class DesignSystemPage {
	private readonly page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	get toolbarButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Design System', exact: true } );
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

	get headerMenuButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Design system actions' } );
	}

	get importMenuItem(): Locator {
		return this.page.getByRole( 'menuitem', { name: 'Import' } );
	}

	get exportMenuItem(): Locator {
		return this.page.getByRole( 'menuitem', { name: 'Export' } );
	}

	get importDialog(): Locator {
		return this.page.getByRole( 'dialog', { name: 'Import Design System' } );
	}

	get fileInput(): Locator {
		return this.importDialog.locator( 'input[type="file"]' );
	}

	get uploadedFileRow(): Locator {
		return this.importDialog.getByRole( 'button', { name: 'Remove file' } );
	}

	get keepExistingRadio(): Locator {
		return this.importDialog.getByRole( 'radio', { name: 'Keep existing values' } );
	}

	get replaceExistingRadio(): Locator {
		return this.importDialog.getByRole( 'radio', { name: 'Replace existing values' } );
	}

	get importButton(): Locator {
		return this.importDialog.getByRole( 'button', { name: 'Import', exact: true } );
	}

	get cancelButton(): Locator {
		return this.importDialog.getByRole( 'button', { name: 'Cancel' } );
	}

	get importInProgressNotification(): Locator {
		return this.page.getByRole( 'alert' ).filter( { hasText: 'Import in Progress' } );
	}

	get importSuccessNotification(): Locator {
		return this.page.getByRole( 'alert' ).filter( { hasText: 'Design system imported' } );
	}

	get importFailedNotification(): Locator {
		return this.page.getByRole( 'alert' ).filter( { hasText: 'import failed' } );
	}

	get exportInProgressNotification(): Locator {
		return this.page.getByRole( 'alert' ).filter( { hasText: 'Export in progress' } );
	}

	get exportSuccessNotification(): Locator {
		return this.page.getByRole( 'alert' ).filter( { hasText: 'Design system exported' } );
	}

	get exportFailedNotification(): Locator {
		return this.page.getByRole( 'alert' ).filter( { hasText: 'export failed' } );
	}

	get tryAgainButton(): Locator {
		return this.page.getByRole( 'alert' ).getByRole( 'button', { name: 'Try again' } );
	}

	async openFromToolbar(): Promise< void > {
		const isInToolbar = await this.toolbarButton.isVisible( { timeout: 2_000 } ).catch( () => false );

		if ( isInToolbar ) {
			await this.toolbarButton.click();
		} else {
			await this.page.getByRole( 'button', { name: 'More', exact: true } ).click();
			await this.page.getByRole( 'menuitem', { name: 'Design System', exact: true } ).click();
		}

		await this.dismissUnsavedChangesDialogIfVisible();
		await this.dismissClassManagerIntroIfVisible();
		await this.panelHeading.waitFor( { state: 'visible' } );
	}

	async dismissClassManagerIntroIfVisible(): Promise< void > {
		const introDialog = this.page.getByRole( 'dialog' ).filter( { hasText: "Don't show this again" } );

		if ( await introDialog.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			await dismissClassManagerIntro( this.page );
		}
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

	async openHeaderMenu(): Promise< void > {
		await this.headerMenuButton.click();
		await this.importMenuItem.waitFor( { state: 'visible' } );
	}

	async openImportDialog(): Promise< void > {
		await this.openHeaderMenu();
		await this.importMenuItem.click();
		await this.importDialog.waitFor( { state: 'visible' } );
	}

	async startExport(): Promise< Download > {
		const downloadPromise = this.page.waitForEvent( 'download' );
		await this.openHeaderMenu();
		await this.exportMenuItem.click();
		return downloadPromise;
	}

	async uploadFile( filePath: string ): Promise< void > {
		const absolutePath = path.isAbsolute( filePath )
			? filePath
			: path.join( __dirname, filePath );

		await this.fileInput.setInputFiles( absolutePath );
	}

	async selectConflictStrategy( strategy: ConflictStrategy ): Promise< void > {
		if ( 'keep' === strategy ) {
			await this.keepExistingRadio.click();
		} else {
			await this.replaceExistingRadio.click();
		}
	}

	async submitImport(): Promise< void > {
		await this.importButton.click();
	}

	async performImport( filePath: string, strategy: ConflictStrategy ): Promise< void > {
		await this.openImportDialog();
		await this.uploadFile( filePath );
		await this.selectConflictStrategy( strategy );
		await this.submitImport();
	}

	async waitForImportSuccess( timeout = 60_000 ): Promise< void > {
		await this.importSuccessNotification.waitFor( { state: 'visible', timeout } );
	}

	async waitForImportFailure( timeout = 30_000 ): Promise< void > {
		await this.importFailedNotification.waitFor( { state: 'visible', timeout } );
	}

	async waitForExportSuccess( timeout = 60_000 ): Promise< void > {
		await this.exportSuccessNotification.waitFor( { state: 'visible', timeout } );
	}

	async waitForExportFailure( timeout = 30_000 ): Promise< void > {
		await this.exportFailedNotification.waitFor( { state: 'visible', timeout } );
	}

	async removeUploadedFile(): Promise< void > {
		await this.uploadedFileRow.click();
	}

	getClassItem( className: string ): Locator {
		return this.panel
			.getByRole( 'tabpanel' )
			.locator( 'li' )
			.filter( { has: this.page.getByRole( 'button', { name: 'More actions' } ) } )
			.filter( { hasText: className } );
	}

	getVariableItem( variableName: string ): Locator {
		return this.panel.locator( '[data-testid="variable-item"]' ).filter( { hasText: variableName } );
	}
}

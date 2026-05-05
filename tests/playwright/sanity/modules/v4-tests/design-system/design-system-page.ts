import { type Locator, type Page } from '@playwright/test';
import EditorPage from '../../../../pages/editor-page';

// Page Object for the Design System panel.
// Encapsulates all locators and interaction helpers so test files stay
// declarative and readable.
export default class DesignSystemPage {
	private readonly page: Page;

	constructor( page: Page ) {
		this.page = page;
	}

	// -------------------------------------------------------------------------
	// Locators
	// -------------------------------------------------------------------------

	// The toolbar toggle button that opens / closes the Design System panel.
	get toolbarButton(): Locator {
		return this.page.getByRole( 'button', { name: 'Design System' } );
	}

	// The whole Design System panel container (the side panel).
	get panel(): Locator {
		return this.page.locator( '#elementor-panel' );
	}

	// The panel heading ("Design system").
	get panelHeading(): Locator {
		return this.panel.getByRole( 'heading', { level: 2 } );
	}

	// Close (×) button in the panel header.
	get closeButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Close' } );
	}

	// The "Variables" tab in the tab strip.
	get variablesTab(): Locator {
		return this.panel.getByRole( 'tab', { name: 'Variables' } );
	}

	// The "Classes" tab in the tab strip.
	get classesTab(): Locator {
		return this.panel.getByRole( 'tab', { name: 'Classes' } );
	}

	// -- Variables tab content ------------------------------------------------

	// "Add variable" / create button shown inside the Variables tab.
	get addVariableButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Add variable' } );
	}

	// Empty-state message shown in the Variables tab when no variables exist.
	get variablesEmptyState(): Locator {
		return this.panel.getByText( 'Create your first variable' );
	}

	// Search field inside the Variables tab.
	get variablesSearchInput(): Locator {
		return this.panel.getByPlaceholder( 'Search' );
	}

	// -- Classes tab content --------------------------------------------------

	// "Save changes" button inside the Classes tab.
	get classesSaveButton(): Locator {
		return this.panel.getByRole( 'button', { name: 'Save changes' } );
	}

	// -------------------------------------------------------------------------
	// Actions
	// -------------------------------------------------------------------------

	// Open the Design System panel from the top-bar toolbar button.
	// Waits until the panel heading is visible before resolving.
	async openFromToolbar(): Promise< void > {
		await this.toolbarButton.click();
		await this.panelHeading.waitFor( { state: 'visible' } );
	}

	// Close the Design System panel using the header Close button.
	// Waits until the panel heading is hidden before resolving.
	async closePanel(): Promise< void > {
		await this.closeButton.click();
		await this.panelHeading.waitFor( { state: 'hidden' } );
	}

	// Switch to the Variables tab and wait for the tab content to render.
	async switchToVariablesTab(): Promise< void > {
		await this.variablesTab.click();
		await this.addVariableButton.waitFor( { state: 'visible' } );
	}

	// Switch to the Classes tab and wait for the tab content to render.
	async switchToClassesTab(): Promise< void > {
		await this.classesTab.click();
		await this.classesSaveButton.waitFor( { state: 'visible' } );
	}

	// Open the Design System panel from the "Class Manager" button inside the
	// v4 style panel (requires a widget to be selected first).
	// When the `e_editor_design_system_panel` experiment is active the button
	// dispatches `elementor/toggle-design-system { tab: 'classes' }` instead
	// of opening the standalone class-manager panel directly.
	async openFromClassManagerButton( editor: EditorPage, elementId: string ): Promise< void > {
		await editor.selectElement( elementId );
		await editor.v4Panel.openTab( 'style' );
		await this.page.getByRole( 'button', { name: 'Class Manager' } ).click();

		// Dismiss the intro dialog if it appears (first-run experience).
		// Check visibility first to avoid the no-force-option lint rule.
		const gotItButton = this.page
			.getByRole( 'dialog' )
			.filter( { hasText: "Don't show this again" } )
			.getByRole( 'button', { name: 'Got it introduction' } );

		if ( await gotItButton.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			await gotItButton.click();
		}

		await this.panelHeading.waitFor( { state: 'visible' } );
	}

	// Dismiss the "You have unsaved changes" dialog if it is visible, by
	// clicking the "Save & Continue" option.  Safe to call even when the
	// dialog is not present.
	async dismissUnsavedChangesDialogIfVisible(): Promise< void > {
		const dialog = this.page.getByRole( 'dialog', { name: 'You have unsaved changes' } );
		const saveAndContinue = dialog.getByRole( 'button', { name: 'Save & Continue' } );

		if ( await saveAndContinue.isVisible( { timeout: 2000 } ).catch( () => false ) ) {
			await saveAndContinue.click();
		}
	}
}

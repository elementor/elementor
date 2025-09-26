import { Browser, BrowserContext, Page } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page';
import EditorPage from '../pages/editor-page';

export interface DriverContext {
	browser: Browser;
	context: BrowserContext;
	page: Page;
	wpAdmin: WpAdminPage;
	editor: EditorPage;
}

export interface WidgetTestResult {
	containerId: string;
	widgetId: string;
	widgetSelector: string;
}

export class EditorDriver {
	private readonly browser: Browser;
	private readonly browserContext: BrowserContext;
	private readonly pageInstance: Page;
	private readonly wpAdminInstance: WpAdminPage;
	private editorInstance: EditorPage;
	private lastWidgetResult?: WidgetTestResult;

	constructor( context: DriverContext ) {
		this.browser = context.browser;
		this.browserContext = context.context;
		this.pageInstance = context.page;
		this.wpAdminInstance = context.wpAdmin;
		this.editorInstance = context.editor;
	}

	get context(): DriverContext {
		return {
			browser: this.browser,
			context: this.browserContext,
			page: this.pageInstance,
			wpAdmin: this.wpAdminInstance,
			editor: this.editorInstance,
		};
	}

	get editor(): EditorPage {
		return this.editorInstance;
	}

	get wpAdmin(): WpAdminPage {
		return this.wpAdminInstance;
	}

	get page(): Page {
		return this.pageInstance;
	}

	get lastWidget(): WidgetTestResult | undefined {
		return this.lastWidgetResult;
	}

	async createNewPage(): Promise<EditorDriver> {
		await this.wpAdmin.openNewPage();
		return this;
	}

	async setupBasicPage(): Promise<EditorDriver> {
		await this.createNewPage();
		await this.editor.closeNavigatorIfOpen();
		
		// Handle any modal dialogs that might be blocking interactions
		await this.handleModalDialogs();
		
		await this.editor.openElementsPanel();
		return this;
	}

	async setupPageWithWidget(
		widget: string,
		container?: { elType: string },
	): Promise<WidgetTestResult> {
		await this.setupBasicPage();

		const containerToUse = container || { elType: 'container' };
		const containerId = await this.editor.addElement( containerToUse, 'document' );
		const widgetId = await this.editor.addWidget( { widgetType: widget, container: containerId } );
		const widgetSelector = this.editor.getWidgetSelector( widgetId );

		this.lastWidgetResult = {
			containerId,
			widgetId,
			widgetSelector,
		};

		return this.lastWidgetResult;
	}

	async close(): Promise<void> {
		await this.browserContext.close();
	}

	/**
	 * Handle any modal dialogs that might be blocking interactions
	 */
	private async handleModalDialogs(): Promise<void> {
		// Handle experiment confirmation dialogs
		const experimentDialog = this.page.locator( '.dialog-type-confirm .dialog-confirm-ok' );
		if ( await experimentDialog.isVisible() ) {
			await experimentDialog.click();
			await this.page.waitForLoadState( 'load' );
		}

		// Handle any other common modal dialogs
		const commonModalSelectors = [
			'.MuiDialog-container button[aria-label="close"]',
			'.elementor-templates-modal__header__close',
			'.dialog-button.dialog-ok',
		];

		for ( const selector of commonModalSelectors ) {
			const modal = this.page.locator( selector );
			if ( await modal.isVisible() ) {
				await modal.click();
				await this.page.waitForTimeout( 500 ); // Wait for modal to close
			}
		}
	}
}

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

	async createNewPage( closeNavigator: boolean = false ): Promise<EditorDriver> {
		await this.wpAdmin.openNewPage();
		if ( closeNavigator ) {
			await this.editor.closeNavigatorIfOpen();
		}
		return this;
	}

	async close(): Promise<void> {
		await this.browserContext.close();
	}
}

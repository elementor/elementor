import { Browser, BrowserContext, Page, TestInfo } from '@playwright/test';
import { EditorDriver, DriverContext } from './editor-driver';
import WpAdminPage from '../pages/wp-admin-page';
import ApiRequests from '../assets/api-requests';
import { wpCli } from '../assets/wp-cli';

export class DriverFactory {
	private static async createTemporaryContext(
		browser: Browser,
		testInfo?: TestInfo,
		apiRequests?: ApiRequests,
	): Promise<{
		context: BrowserContext;
		page: Page;
		wpAdmin: WpAdminPage;
	}> {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );

		return { context, page, wpAdmin };
	}

	static async createEditorDriver( browser: Browser, testInfo?: TestInfo, apiRequests?: ApiRequests ): Promise<EditorDriver> {
		const { context, wpAdmin } = await this.createTemporaryContext( browser, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const driverContext: DriverContext = {
			browser,
			context,
			page: editor.page,
			wpAdmin,
			editor,
		};

		return new EditorDriver( driverContext );
	}

	static async setExperiments( browser: Browser, experiments: { [key: string]: boolean | string }, testInfo?: TestInfo, apiRequests?: ApiRequests ): Promise<void> {
		const { context, wpAdmin } = await this.createTemporaryContext( browser, testInfo, apiRequests );

		await wpAdmin.setExperiments( experiments );
		await context.close();
	}

	static async resetExperiments( browser: Browser, testInfo?: TestInfo, apiRequests?: ApiRequests ): Promise<void> {
		const { context, wpAdmin } = await this.createTemporaryContext( browser, testInfo, apiRequests );

		await wpAdmin.resetExperiments();
		await context.close();
	}

	static async activateExperimentsCli( experiments: string[] ): Promise<void> {
		for ( const experiment of experiments ) {
			await wpCli( `wp elementor experiments activate ${ experiment }` );
		}
	}

	static async deactivateExperimentsCli( experiments: string[] ): Promise<void> {
		for ( const experiment of experiments ) {
			await wpCli( `wp elementor experiments deactivate ${ experiment }` );
		}
	}
}

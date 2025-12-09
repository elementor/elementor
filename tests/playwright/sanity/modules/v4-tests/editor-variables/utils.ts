import { TestInfo, type Page } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';
import { wpCli } from '../../../../assets/wp-cli';

export const initTemplate = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await wpCli( 'wp elementor experiments activate e_atomic_elements' );
	await wpCli( 'wp elementor experiments activate e_variables' );
	await wpCli( 'wp elementor experiments activate e_variables_manager' );
	const editorPage = await wpAdminPage.openNewPage();
	await editorPage.loadTemplate( 'tests/playwright/sanity/modules/v4-tests/editor-variables/variables-manager-template.json' );
	return wpAdminPage;
};


import { TestInfo, type Page } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';
import { DriverFactory } from '../../../../drivers/driver-factory';

export const initTemplate = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await DriverFactory.activateExperimentsCli( [ 'e_atomic_elements', 'e_variables', 'e_variables_manager' ] );
	const editorPage = await wpAdminPage.openNewPage();
	await editorPage.loadTemplate( 'tests/playwright/sanity/modules/v4-tests/editor-variables/variables-manager-template.json' );
	return wpAdminPage;
};


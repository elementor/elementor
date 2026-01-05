import { TestInfo, type Page } from '@playwright/test';
import _path from 'path';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';

export const getTemplatePath = () => _path.resolve( __dirname, './variables-manager-template.json' );

export const initTemplate = async ( page: Page, testInfo: TestInfo, apiRequests: ApiRequests ) => {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdminPage.setExperiments( { e_variables: 'active', e_atomic_elements: 'active' } );
	await wpAdminPage.setExperiments( { e_variables_manager: 'active' } );
	const editorPage = await wpAdminPage.openNewPage();
	await editorPage.loadTemplate( getTemplatePath() );
	return { wpAdminPage, editorPage };
};


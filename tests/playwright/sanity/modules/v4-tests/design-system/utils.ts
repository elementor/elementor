import { type Page, type TestInfo } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';
import { deleteAllGlobalClasses } from '../global-classes/utils';
import { deleteAllVariablesViaApi } from '../editor-variables/variables-api-utils';

export const DESIGN_SYSTEM_EXPERIMENTS = {
	e_atomic_elements: 'active',
	e_classes: 'active',
	e_variables: 'active',
	e_variables_manager: 'active',
	e_editor_design_system_panel: 'active',
} as const;

export async function initDesignSystemTest(
	page: Page,
	testInfo: TestInfo,
	apiRequests: ApiRequests,
): Promise< WpAdminPage > {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdminPage.setExperiments( DESIGN_SYSTEM_EXPERIMENTS );
	await wpAdminPage.openNewPage();
	return wpAdminPage;
}

export async function cleanupDesignSystemData(
	apiRequests: ApiRequests,
	page: Page,
): Promise< void > {
	const { request } = page.context();
	await deleteAllGlobalClasses( apiRequests, request );
	await deleteAllVariablesViaApi( apiRequests, request );
}

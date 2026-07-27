import { type Page, type TestInfo } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';
import { deleteAllVariablesViaApi } from './variables-api-utils';

// Variables and Variables Manager are merged into Editor V4, so enabling V4 enables them.
const VARIABLES_BASE_EXPERIMENTS = {
	e_atomic_elements: 'active',
	e_classes: 'active',
} as const;

export async function initVariablesManagerTest(
	page: Page,
	testInfo: TestInfo,
	apiRequests: ApiRequests,
): Promise< WpAdminPage > {
	const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
	await wpAdminPage.setExperiments( VARIABLES_BASE_EXPERIMENTS );
	return wpAdminPage;
}

export async function cleanupVariables(
	apiRequests: ApiRequests,
	page: Page,
): Promise< void > {
	const { request } = page.context();
	await deleteAllVariablesViaApi( apiRequests, request );
}

import { type APIRequestContext, type Page, type TestInfo } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import ApiRequests from '../../../../assets/api-requests';
import { createGlobalClasses, deleteAllGlobalClasses, getGlobalClasses } from '../global-classes/utils';
import { createVariableWithSync, deleteAllVariablesViaApi } from '../editor-variables/variables-api-utils';

export const DESIGN_SYSTEM_EXPERIMENTS = {
	e_atomic_elements: 'active',
	e_classes: 'active',
	e_variables: 'active',
	e_variables_manager: 'active',
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

export async function createTestClass(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	options: {
		id: string;
		label: string;
		props?: Record< string, unknown >;
	},
): Promise< void > {
	const classItem = {
		id: options.id,
		type: 'class' as const,
		label: options.label,
		variants: [ {
			meta: { breakpoint: 'desktop', state: null },
			props: options.props ?? { color: { $$type: 'color', value: '#000000' } },
			custom_css: null,
		} ],
	};

	const { items: existingItems, order: existingOrder } = await getGlobalClasses( apiRequests, request );

	const items: Record< string, typeof classItem > = {};
	for ( const [ key, val ] of Object.entries( existingItems ) ) {
		items[ key ] = {
			id: val.id,
			type: 'class',
			label: val.label,
			variants: [ {
				meta: { breakpoint: 'desktop', state: null },
				props: {},
				custom_css: null,
			} ],
		};
	}
	items[ options.id ] = classItem;

	const order = [ ...existingOrder, options.id ];

	await createGlobalClasses( apiRequests, request, items, order );
}

export async function createTestVariable(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	options: {
		id: string;
		label: string;
		value: string;
		type: 'color' | 'font-size' | 'font-family' | 'font-weight';
	},
): Promise< void > {
	await createVariableWithSync( apiRequests, request, {
		id: options.id,
		label: options.label,
		value: options.value,
		type: options.type,
		syncToV3: false,
	} );
}

export async function mockApiRoute(
	page: Page,
	urlPattern: string | RegExp,
	response: { status?: number; body?: unknown; delay?: number },
): Promise< void > {
	await page.route( urlPattern, async ( route ) => {
		if ( response.delay ) {
			await new Promise( ( resolve ) => setTimeout( resolve, response.delay ) );
		}

		await route.fulfill( {
			status: response.status ?? 200,
			contentType: 'application/json',
			body: JSON.stringify( response.body ?? {} ),
		} );
	} );
}

export async function delayApiRoute(
	page: Page,
	urlPattern: string | RegExp,
	delayMs: number,
): Promise< void > {
	await page.route( urlPattern, async ( route ) => {
		await new Promise( ( resolve ) => setTimeout( resolve, delayMs ) );
		await route.continue();
	} );
}

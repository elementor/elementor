import { type APIRequestContext } from '@playwright/test';
import ApiRequests from '../../../assets/api-requests';

export const THEME_BUILDER_PROMOTION_OPTION_KEY = 'elementor_theme_builder_promotion_enabled';
export const THEME_BUILDER_PROMOTION_HEADER_FOOTER_INTRODUCTION_KEY = 'introduce_theme_builder_header_footer_popup';
export const THEME_BUILDER_PROMOTION_SEED_PAGE_TITLE_PREFIX = 'TB Promotion Seed';
const MIN_PUBLISHED_ELEMENTOR_PAGES_FOR_HEADER_FOOTER = 5;
const ELEMENTOR_SETTING_ROUTE_PREFIX = 'index.php?rest_route=/elementor/v1/settings';
const CHECKLIST_USER_PROGRESS_ROUTE = 'wp-json/elementor/v1/checklist/user-progress';

async function updateElementorSetting(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	key: string,
	value: string,
): Promise< void > {
	await apiRequests.customPut( request, `${ ELEMENTOR_SETTING_ROUTE_PREFIX }/${ key }`, { value } );
}

export async function enableThemeBuilderPromotion(
	apiRequests: ApiRequests,
	request: APIRequestContext,
): Promise< void > {
	await updateElementorSetting( apiRequests, request, THEME_BUILDER_PROMOTION_OPTION_KEY, '1' );
}

export async function disableThemeBuilderPromotion(
	apiRequests: ApiRequests,
	request: APIRequestContext,
): Promise< void > {
	await updateElementorSetting( apiRequests, request, THEME_BUILDER_PROMOTION_OPTION_KEY, '0' );
}

export async function seedHeaderFooterPromotionPages(
	apiRequests: ApiRequests,
	request: APIRequestContext,
): Promise< void > {
	for ( let index = 1; index <= MIN_PUBLISHED_ELEMENTOR_PAGES_FOR_HEADER_FOOTER; index++ ) {
		const pageId = await apiRequests.create( request, 'pages', {
			title: `${ THEME_BUILDER_PROMOTION_SEED_PAGE_TITLE_PREFIX } ${ index }`,
			status: 'publish',
			content: '',
		} );

		await apiRequests.customPut( request, `index.php?rest_route=/wp/v2/pages/${ pageId }`, {
			meta: {
				_elementor_edit_mode: 'builder',
				_elementor_data: '[]',
			},
		} );
	}
}

export async function resetEditorCounter(
	apiRequests: ApiRequests,
	request: APIRequestContext,
	count: number,
): Promise< void > {
	await apiRequests.customPut( request, CHECKLIST_USER_PROGRESS_ROUTE, {
		e_editor_counter: count,
	} );
}

export async function cleanupHeaderFooterPromotionTestData(
	apiRequests: ApiRequests,
	request: APIRequestContext,
): Promise< void > {
	const pages = await apiRequests.customGet(
		request,
		`index.php?rest_route=/wp/v2/pages&status=any&per_page=100&search=${ encodeURIComponent( THEME_BUILDER_PROMOTION_SEED_PAGE_TITLE_PREFIX ) }`,
	);

	for ( const page of pages ) {
		await apiRequests.delete( request, 'pages', String( page.id ) );
	}

	const user = await apiRequests.customGet( request, 'index.php?rest_route=/wp/v2/users/1' );
	const introduction = { ...( user.elementor_introduction || {} ) };

	delete introduction[ THEME_BUILDER_PROMOTION_HEADER_FOOTER_INTRODUCTION_KEY ];

	await apiRequests.customPut( request, 'index.php?rest_route=/wp/v2/users/1', {
		elementor_introduction: introduction,
	} );

	await disableThemeBuilderPromotion( apiRequests, request );
}

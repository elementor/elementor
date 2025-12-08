import { type Page, type APIRequestContext } from '@playwright/test';
import { resolve } from 'path';
import homeScreenMockData from './data/home-screen.mock';
import ApiRequests from '../../../assets/api-requests';
import { Image } from '../../../types/types';

export type HomepageSettings = {
	homepageId: number | null;
	showOnFront: string | null;
};

export type LicenseType = 'free' | 'pro' | 'one';

export const transformMockDataByLicense = ( licenseType: LicenseType ) => {
	const topItem = homeScreenMockData.top_with_licences.find( ( item ) => item.license.includes( licenseType ) )!;
	const getStartedItem = homeScreenMockData.get_started.find( ( item ) => item.license.includes( licenseType ) )!;
	const sidebarPromotionItem = homeScreenMockData.sidebar_promotion_variants.find(
		( item ) => 'true' === item.is_enabled && item.license.includes( licenseType ),
	);

	return {
		top_with_licences: topItem,
		get_started: getStartedItem,
		add_ons: homeScreenMockData.add_ons,
		sidebar_upgrade: homeScreenMockData.sidebar_upgrade,
		...( sidebarPromotionItem && { sidebar_promotion_variants: sidebarPromotionItem } ),
		external_links: homeScreenMockData.external_links,
	};
};

export const mockHomeScreenData = async ( page: Page, mockData: ReturnType<typeof transformMockDataByLicense>, apiRequests?: ApiRequests, requestContext?: APIRequestContext ) => {
	let finalMockData = mockData;

	if ( apiRequests && requestContext ) {
		const mediaUrl = await uploadImage( apiRequests, requestContext );
		finalMockData = replaceImageUrl( mockData, mediaUrl );
	}

	await page.route( '**/wp-admin/admin.php?page=elementor', async ( route ) => {
		const response = await route.fetch();
		const body = await response.text();
		
		const existingDataMatch = body.match( /var elementorHomeScreenData\s*=\s*(\{[\s\S]*?\});/ );
		let mergedData = finalMockData;
		
		if ( existingDataMatch ) {
			try {
				const existingData = JSON.parse( existingDataMatch[1] );
				mergedData = {
					...existingData,
					...finalMockData,
					isEditorOneActive: existingData.isEditorOneActive,
					_debug: existingData._debug,
				};
			} catch ( e ) {
				mergedData = finalMockData;
			}
		}
		
		const mockDataJson = JSON.stringify( mergedData ).replace( /</g, '\\u003c' );

		const modifiedBody = body.replace(
			/var elementorHomeScreenData\s*=\s*\{[\s\S]*?\};/,
			`var elementorHomeScreenData = ${ mockDataJson };`,
		);

		await route.fulfill( {
			response,
			body: modifiedBody,
			headers: response.headers(),
		} );
	} );
};

const uploadImage = async (
	apiRequests: ApiRequests,
	requestContext: APIRequestContext,
): Promise<string> => {
	try {
		const imagePath = resolve( __dirname, './assets/upgrade-free.png' );
		const imageData: Image = {
			title: 'upgrade-free',
			extension: 'png',
			filePath: imagePath,
		};
		return await apiRequests.uploadImageAndGetUrl( requestContext, imageData );
	} catch ( error ) {
		throw new Error( `Failed to upload upgrade-free.png: ${ error instanceof Error ? error.message : String( error ) }` );
	}
};

const replaceImageUrl = (
	mockData: ReturnType<typeof transformMockDataByLicense>,
	mediaUrl: string,
): ReturnType<typeof transformMockDataByLicense> => {
	const dataStr = JSON.stringify( mockData );
	if ( dataStr.includes( '__UPGRADE_FREE_SVG_PLACEHOLDER__' ) ) {
		const updatedStr = dataStr.replace( /"__UPGRADE_FREE_SVG_PLACEHOLDER__"/g, JSON.stringify( mediaUrl ) );
		return JSON.parse( updatedStr );
	}

	return mockData;
};

export const navigateToHomeScreen = async ( page: Page ) => {
	await page.goto( 'wp-admin/admin.php?page=elementor' );
	return page.locator( '#e-home-screen' );
};

export const saveHomepageSettings = async ( apiRequests: ApiRequests, requestContext: APIRequestContext ): Promise<HomepageSettings> => {
	try {
		const homepageResponse = await apiRequests.customGet( requestContext, 'index.php?rest_route=/wp/v2/options/page_on_front' );
		const showOnFrontResponse = await apiRequests.customGet( requestContext, 'index.php?rest_route=/wp/v2/options/show_on_front' );

		return {
			homepageId: homepageResponse?.value || null,
			showOnFront: showOnFrontResponse?.value || null,
		};
	} catch ( error ) {
		return {
			homepageId: null,
			showOnFront: null,
		};
	}
};

export const restoreHomepageSettings = async ( apiRequests: ApiRequests, requestContext: APIRequestContext, settings: HomepageSettings ): Promise<void> => {
	if ( null === settings.homepageId && null === settings.showOnFront ) {
		return;
	}

	try {
		if ( settings.homepageId !== null ) {
			await apiRequests.customPut( requestContext, 'index.php?rest_route=/wp/v2/options/page_on_front', { value: settings.homepageId } );
		}
		if ( settings.showOnFront !== null ) {
			await apiRequests.customPut( requestContext, 'index.php?rest_route=/wp/v2/options/show_on_front', { value: settings.showOnFront } );
		}
	} catch ( error ) {
	}
};

export const setHomepage = async ( apiRequests: ApiRequests, requestContext: APIRequestContext, pageId: number ): Promise<void> => {
	await apiRequests.customPut( requestContext, 'index.php?rest_route=/wp/v2/options/page_on_front', { value: pageId } );
	await apiRequests.customPut( requestContext, 'index.php?rest_route=/wp/v2/options/show_on_front', { value: 'page' } );
};

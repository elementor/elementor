import { type Page, type APIRequestContext } from '@playwright/test';
import { resolve } from 'path';
import homeScreenMockData from './data/home-screen.mock';
import ApiRequests from '../../../assets/api-requests';
import { Image } from '../../../types/types';

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
		const imagePath = resolve( __dirname, './assets/upgrade-free.png' );
		const imageData: Image = {
			title: 'upgrade-free',
			extension: 'png',
			filePath: imagePath,
		};

		try {
			const mediaResult = await apiRequests.createMedia( requestContext, imageData );
			if ( ! mediaResult || ! mediaResult.url ) {
				throw new Error( `Media upload failed. Result: ${ JSON.stringify( mediaResult ) }` );
			}
			const dataStr = JSON.stringify( mockData );
			if ( ! dataStr.includes( '__UPGRADE_FREE_SVG_PLACEHOLDER__' ) ) {
				throw new Error( `Placeholder not found in mock data. Data preview: ${ dataStr.substring( 0, 500 ) }` );
			}
			const updatedStr = dataStr.replace( /"__UPGRADE_FREE_SVG_PLACEHOLDER__"/g, JSON.stringify( mediaResult.url ) );
			if ( updatedStr.includes( '__UPGRADE_FREE_SVG_PLACEHOLDER__' ) ) {
				throw new Error( `Replacement failed. Updated data still contains placeholder. URL: ${ mediaResult.url }` );
			}
			finalMockData = JSON.parse( updatedStr );
		} catch ( error ) {
			throw new Error( `Failed to upload and replace upgrade-free.png: ${ error instanceof Error ? error.message : String( error ) }` );
		}
	}

	await page.route( '**/wp-admin/admin.php?page=elementor', async ( route ) => {
		const response = await route.fetch();
		const body = await response.text();
		const mockDataJson = JSON.stringify( finalMockData ).replace( /</g, '\\u003c' );

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

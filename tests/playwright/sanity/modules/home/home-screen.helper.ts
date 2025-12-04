import { type Page, type APIRequestContext } from '@playwright/test';
import { resolve } from 'path';
import { createReadStream } from 'fs';
import homeScreenMockData from './data/home-screen.mock';
import ApiRequests from '../../../assets/api-requests';
import { Image } from '../../../types/types';
import { fetchNonce } from '../../../wp-authentication';

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
		try {
			const mediaUrl = await uploadImage( page, requestContext );
			finalMockData = replacePlaceholderImage( mockData, mediaUrl );
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

const uploadImage = async (
	page: Page,
	requestContext: APIRequestContext,
): Promise<string> => {
	const imagePath = resolve( __dirname, './assets/upgrade-free.png' );
	const imageData: Image = {
		title: 'upgrade-free',
		extension: 'png',
		filePath: imagePath,
	};

	let baseUrl = '';
	const pageUrl = page.url();
	if ( pageUrl && pageUrl !== 'about:blank' ) {
		baseUrl = pageUrl.split( '/wp-admin' )[ 0 ];
	} else {
		baseUrl = process.env.BASE_URL || process.env.TEST_SERVER || process.env.DEV_SERVER || '';
	}

	const nonce = await fetchNonce( requestContext, baseUrl );

	const multipart = {
		file: createReadStream( imagePath ),
		status: 'publish',
		...imageData,
	};

	const response = await requestContext.post( `${ baseUrl }/index.php`, {
		params: { rest_route: '/wp/v2/media' },
		headers: {
			'X-WP-Nonce': nonce,
		},
		multipart,
	} );

	if ( ! response.ok() ) {
		throw new Error( `Failed to create media: ${ response.status() }. ${ await response.text() }` );
	}

	const mediaData = await response.json();
	const mediaUrl = mediaData.source_url || mediaData.guid?.rendered || mediaData.link;

	if ( ! mediaUrl ) {
		throw new Error( `Media URL not found in response. Media data: ${ JSON.stringify( mediaData ) }` );
	}

	return mediaUrl;
};

const replacePlaceholderImage = (
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

import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import homeScreenMockData from './home-screen.mock';

type LicenseType = 'free' | 'pro';

type TransformedMockData = {
	top_with_licences: typeof homeScreenMockData.top_with_licences[0];
	get_started: typeof homeScreenMockData.get_started[0];
	add_ons: typeof homeScreenMockData.add_ons;
	sidebar_upgrade: typeof homeScreenMockData.sidebar_upgrade;
	sidebar_promotion_variants?: typeof homeScreenMockData.sidebar_promotion_variants[0];
	external_links: typeof homeScreenMockData.external_links;
};

const transformMockDataByLicense = ( licenseType: LicenseType ) => {
	const topItem = homeScreenMockData.top_with_licences.find( ( item ) => item.license.includes( licenseType ) );
	if ( ! topItem ) {
		throw new Error( `No top_with_licences item found for license: ${ licenseType }` );
	}

	const getStartedItem = homeScreenMockData.get_started.find( ( item ) => item.license.includes( licenseType ) );
	if ( ! getStartedItem ) {
		throw new Error( `No get_started item found for license: ${ licenseType }` );
	}

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
	} as TransformedMockData;
};

declare global {
	interface Window {
		elementorHomeScreenData: ReturnType<typeof transformMockDataByLicense>;
	}
}

const mockHomeScreenData = async ( page: Page, mockData: ReturnType<typeof transformMockDataByLicense> ) => {
	await page.addInitScript( ( data ) => {
		// @ts-expect-error - Type mismatch due to optional properties in repeater items
		window.elementorHomeScreenData = data;
	}, mockData );
};

test.describe( 'Home screen visual regression tests', () => {
	const licenseTypes: LicenseType[] = [ 'free', 'pro' ];

	for ( const licenseType of licenseTypes ) {
		test( `${ licenseType } license variant - UI renders correctly with mocked data`, async ( { page }, testInfo ) => {
			const mockData = transformMockDataByLicense( licenseType );
			await mockHomeScreenData( page, mockData );
			await page.goto( 'wp-admin/admin.php?page=elementor' );
			await page.waitForURL( '**/wp-admin/admin.php?page=elementor' );
			await page.waitForSelector( '#e-home-screen', { timeout: 10000 } );
			await page.waitForLoadState( 'networkidle' );

			const topSection = page.locator( '[data-testid="e-create-button"]' ).locator( '..' ).locator( '..' );
			await expect( topSection ).toBeVisible();

			const createButton = page.locator( '[data-testid="e-create-button"]' );
			await expect( createButton ).toBeVisible();
			await expect( createButton ).toContainText( mockData.top_with_licences.button_create_page_title );

			const topTitle = page.getByText( mockData.top_with_licences.title );
			await expect( topTitle ).toBeVisible();

			const topDescription = page.getByText( mockData.top_with_licences.description );
			await expect( topDescription ).toBeVisible();

			const getStartedSection = page.getByText( mockData.get_started.header.title );
			await expect( getStartedSection ).toBeVisible();

			const addonsSection = page.getByText( mockData.add_ons.header.title );
			await expect( addonsSection ).toBeVisible();

			const homeScreen = page.locator( '#e-home-screen' );
			await homeScreen.screenshot( {
				path: testInfo.outputPath( `home-screen-${ licenseType }.png` ),
			} );
		} );
	}
} );

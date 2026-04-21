import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import { mockHomeScreenData, navigateToHomeScreen, getScreenshotName, transformMockDataByLicense, type LicenseType } from './home-screen.helper';

const VIEWPORT_SIZE = { width: 1280, height: 900 };

const INIT_STEP_CONFIG = {
	hasInput: true,
	title: 'From idea to website in minutes',
	placeholder: 'What site do you want to build?',
	buttonLabel: 'Create my site',
};

const WIREFRAMES_STEP_CONFIG = {
	hasInput: false,
	title: "Let's turn your sitemap into a design",
	text: 'Your sitemap is waiting for you to continue.',
	buttonLabel: 'Visit sitemap',
};

test.describe( 'SiteBuilder UI snapshot tests', () => {
	test( 'step with input - INIT step renders correctly', async ( { page } ) => {
		const mockData = {
			...transformMockDataByLicense( 'free' as LicenseType ),
			site_builder: {
				siteBuilderUrl: '/wp-admin/admin.php?page=elementor-app#site-builder',
				stepConfig: { 0: INIT_STEP_CONFIG },
			},
			siteBuilderSnapshot: {},
		};

		await mockHomeScreenData( page, mockData as unknown as ReturnType<typeof transformMockDataByLicense> );

		const homeScreen = await navigateToHomeScreen( page );
		await page.setViewportSize( VIEWPORT_SIZE );

		const siteBuilder = homeScreen.locator( '[data-testid="e-site-builder"]' );
		await expect( siteBuilder ).toBeVisible();
		await expect.soft( siteBuilder ).toHaveScreenshot( await getScreenshotName( page, 'site-builder-step-with-input.png' ) );
	} );

	test( 'step without input - WIREFRAMES step renders correctly', async ( { page } ) => {
		const mockData = {
			...transformMockDataByLicense( 'free' as LicenseType ),
			site_builder: {
				siteBuilderUrl: '/wp-admin/admin.php?page=elementor-app#site-builder',
				stepConfig: { 3: WIREFRAMES_STEP_CONFIG },
				connectAuth: {
					siteKey: 'test-site-key',
					signature: 'test-signature',
					accessToken: 'test-token',
					clientId: 'test-client',
					homeUrl: 'https://example.com',
				},
			},
			siteBuilderSnapshot: {
				'test-site-key': {
					step: 3,
					pageSuggestions: [ 'About', 'Services', 'Contact' ],
					siteTypeSuggestions: [],
				},
			},
		};

		await mockHomeScreenData( page, mockData as unknown as ReturnType<typeof transformMockDataByLicense> );

		const homeScreen = await navigateToHomeScreen( page );
		await page.setViewportSize( VIEWPORT_SIZE );

		const siteBuilder = homeScreen.locator( '[data-testid="e-site-builder"]' );
		await expect( siteBuilder ).toBeVisible();
		await expect.soft( siteBuilder ).toHaveScreenshot( await getScreenshotName( page, 'site-builder-step-without-input.png' ) );
	} );
} );

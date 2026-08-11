import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../../parallelTest';
import WpAdminPage from '../../../../../pages/wp-admin-page';
import {
	ONBOARDING_URL,
	mockOnboardingApi,
	doAndWaitForProgress,
	navigateAndPassLogin,
	navigateToSiteFeaturesStep,
} from './onboarding-utils';

test.describe( 'Onboarding @onboarding', () => {
	let originalActiveTheme: string;

	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		originalActiveTheme = await wpAdmin.getActiveTheme();
		await wpAdmin.activateTheme( 'twentytwentyfive' );
		await page.close();
		await context.close();
	} );

	test.afterAll( async ( { browser, apiRequests }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.activateTheme( originalActiveTheme );
		await page.close();
		await context.close();
	} );

	test( 'Connect screen shows upgrade and guest continue reaches site features', async ( { page } ) => {
		await mockOnboardingApi( page );
		await page.goto( ONBOARDING_URL );

		await expect( page.getByTestId( 'login-screen' ) ).toBeVisible();
		await expect( page.getByRole( 'heading', { name: "Let's get to work." } ) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Upgrade' } ) ).toBeVisible();
		await expect( page.getByRole( 'button', { name: 'Sign in to Elementor' } ) ).toBeVisible();
		await expect( page.getByRole( 'link', { name: 'Continue as a guest' } ) ).toBeVisible();

		await page.getByRole( 'link', { name: 'Continue as a guest' } ).click();

		await expect( page.getByTestId( 'site-features-step' ) ).toBeVisible();
		await expect(
			page.getByRole( 'heading', { name: 'What do you want to include in your site?' } ),
		).toBeVisible();
		await expect( page.getByTestId( 'building-for-step' ) ).toBeHidden();
		await expect( page.getByTestId( 'site-about-step' ) ).toBeHidden();
		await expect( page.getByTestId( 'experience-level-step' ) ).toBeHidden();
	} );

	test( 'Skip on site_features shows completion screen and redirects to new page', async ( { page } ) => {
		const { progressRequests } = await mockOnboardingApi( page );
		await navigateToSiteFeaturesStep( page );

		await page.route( '**/edit.php**', ( route ) =>
			route.fulfill( { status: 200, contentType: 'text/html', body: '<html></html>' } ),
		);

		const [ navigationRequest ] = await Promise.all( [
			page.waitForRequest( ( req ) => req.url().includes( 'edit.php' ) ),
			doAndWaitForProgress( page, () =>
				page.getByRole( 'button', { name: 'Skip' } ).click(),
			),
		] );

		expect( progressRequests.at( -1 ) ).toMatchObject( {
			skip_step: true,
			complete: true,
		} );

		expect( navigationRequest.url() ).toContain( 'action=elementor_new_post' );
	} );

	test( 'Core site_features defaults: Hello selected, Cookie Consent unselected, after Email delivery', async ( { page } ) => {
		await mockOnboardingApi( page );
		await navigateToSiteFeaturesStep( page );

		const helloCard = page.getByTestId( 'feature-card-hello_theme' );
		const cookieCard = page.getByTestId( 'feature-card-cookie_consent' );
		const emailCard = page.getByTestId( 'feature-card-email_deliverability' );

		await expect( helloCard ).toBeVisible();
		await expect( helloCard ).toHaveAttribute( 'aria-pressed', 'true' );

		await expect( cookieCard ).toBeVisible();
		await expect( cookieCard ).toHaveAttribute( 'aria-pressed', 'false' );

		const emailBox = await emailCard.boundingBox();
		const cookieBox = await cookieCard.boundingBox();
		expect( cookieBox && emailBox ? cookieBox.y >= emailBox.y : false ).toBeTruthy();
	} );

	test( 'Core Continue with Free installs Hello theme when selected', async ( { page } ) => {
		const { installThemeRequests } = await mockOnboardingApi( page );
		await navigateToSiteFeaturesStep( page );

		await page.route( '**/edit.php**', ( route ) =>
			route.fulfill( { status: 200, contentType: 'text/html', body: '<html></html>' } ),
		);

		await Promise.all( [
			page.waitForRequest( ( req ) => req.url().includes( 'edit.php' ) ),
			page.getByRole( 'button', { name: 'Continue with Free' } ).click(),
		] );

		expect( installThemeRequests.some( ( req ) => 'hello-elementor' === req.theme_slug ) ).toBeTruthy();
	} );

	test( 'Back from site_features returns guest to Connect screen', async ( { page } ) => {
		await mockOnboardingApi( page );
		await navigateAndPassLogin( page );

		await page.getByRole( 'button', { name: 'Back' } ).click();
		await expect( page.getByTestId( 'login-screen' ) ).toBeVisible();
	} );
} );

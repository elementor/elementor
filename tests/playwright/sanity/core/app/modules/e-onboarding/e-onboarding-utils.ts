import { type Page, expect } from '@playwright/test';

export const ONBOARDING_URL = '/wp-admin/admin.php?page=elementor-app#onboarding';
export const USER_CHOICES_ENDPOINT = '/wp-json/elementor/v1/e-onboarding/user-choices';
export const USER_PROGRESS_ENDPOINT = '/wp-json/elementor/v1/e-onboarding/user-progress';

export async function mockOnboardingApi( page: Page ) {
	const choicesRequests: Record< string, unknown >[] = [];
	const progressRequests: Record< string, unknown >[] = [];

	await page.route(
		( url ) => url.pathname.includes( USER_CHOICES_ENDPOINT ),
		async ( route ) => {
			const body = route.request().postData();
			if ( body ) {
				choicesRequests.push( JSON.parse( body ) as Record< string, unknown > );
			}

			await route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( { data: 'success' } ),
			} );
		},
	);

	await page.route(
		( url ) => url.pathname.includes( USER_PROGRESS_ENDPOINT ),
		async ( route ) => {
			const body = route.request().postData();
			if ( body ) {
				progressRequests.push( JSON.parse( body ) as Record< string, unknown > );
			}

			await route.fulfill( {
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify( { data: 'success' } ),
			} );
		},
	);

	return { choicesRequests, progressRequests };
}

export async function doAndWaitForProgress( page: Page, action: () => Promise< void > ) {
	await Promise.all( [
		page.waitForResponse(
			( r ) => r.url().includes( USER_PROGRESS_ENDPOINT ) && 'POST' === r.request().method(),
		),
		action(),
	] );
}

export async function navigateAndPassLogin( page: Page ) {
	await page.goto( ONBOARDING_URL );
	await expect( page.getByTestId( 'login-screen' ) ).toBeVisible();
	await page.getByRole( 'button', { name: 'Continue as a guest' } ).click();
	await expect( page.getByTestId( 'building-for-step' ) ).toBeVisible();
}

export async function navigateToSiteFeaturesStep( page: Page ) {
	await navigateAndPassLogin( page );

	await doAndWaitForProgress( page, () =>
		page.getByRole( 'button', { name: 'Just exploring' } ).click(),
	);

	await page.getByRole( 'button', { name: 'Small business' } ).click();
	await doAndWaitForProgress( page, () =>
		page.getByRole( 'button', { name: 'Continue' } ).click(),
	);

	await doAndWaitForProgress( page, () =>
		page.getByRole( 'button', { name: 'I have some experience' } ).click(),
	);

	await doAndWaitForProgress( page, () =>
		page.getByRole( 'button', { name: 'Continue with this theme' } ).click(),
	);

	await expect( page.getByTestId( 'site-features-step' ) ).toBeVisible();
}

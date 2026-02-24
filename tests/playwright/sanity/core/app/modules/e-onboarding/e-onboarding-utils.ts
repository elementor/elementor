import { type Page, expect } from '@playwright/test';
import { wpCli } from '../../../../../assets/wp-cli';

export const ONBOARDING_URL = '/wp-admin/admin.php?page=elementor-app#onboarding';
export const USER_CHOICES_ENDPOINT = '/wp-json/elementor/v1/e-onboarding/user-choices';
export const USER_PROGRESS_ENDPOINT = '/wp-json/elementor/v1/e-onboarding/user-progress';
export const ONBOARDING_PROGRESS_OPTION = 'elementor_e_onboarding_progress';

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

export async function setOnboardingCompletedViaCli() {
	const progressJson = JSON.stringify( {
		current_step_index: 4,
		current_step_id: 'site_features',
		completed_steps: [ 'building_for', 'site_about', 'experience_level', 'theme_selection', 'site_features' ],
		exit_type: 'user_exit',
		last_active_timestamp: Math.floor( Date.now() / 1000 ),
		started_at: Math.floor( Date.now() / 1000 ) - 300,
		completed_at: Math.floor( Date.now() / 1000 ),
		starter_dismissed: false,
	} );

	await wpCli( `wp option update ${ ONBOARDING_PROGRESS_OPTION } '${ progressJson }' --format=json` );
}

export async function resetOnboardingProgressViaCli() {
	await wpCli( `wp option delete ${ ONBOARDING_PROGRESS_OPTION }` );
}

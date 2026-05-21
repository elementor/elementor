import setup, { expect, type Page } from '@playwright/test';
import * as OTPAuth from 'otpauth';
import { getOktaTotpSecret, STORAGE_STATE } from './config/auth';

const MY_ELEMENTOR_LOGIN = 'https://my.elementor.com/login/?redirect_to=%2Fwebsites';
const MY_ELEMENTOR_WEBSITES = 'https://my.elementor.com/websites';
const TOTP_PERIOD_SECONDS = 30;
const TOTP_MIN_REMAINING_SECONDS = 3;

setup( 'authenticate with Okta MFA', async ( { page } ) => {
	setup.setTimeout( 180000 );

	await page.goto( MY_ELEMENTOR_LOGIN, { waitUntil: 'domcontentloaded' } );
	await dismissCookieBanner( page );

	await page.getByRole( 'textbox' ).first().fill( process.env.OKTA_USERNAME! );
	await page.getByRole( 'button', { name: 'Continue' } ).first().click();

	await page.waitForURL( /okta\.com/, { timeout: 30000 } );

	for ( let step = 0; step < 8; step++ ) {
		if ( isLoggedInToMyElementor( page.url() ) ) {
			break;
		}
		await completeOktaStep( page );
		await page.waitForLoadState( 'domcontentloaded' );
	}

	if ( ! isLoggedInToMyElementor( page.url() ) ) {
		await page.goto( MY_ELEMENTOR_WEBSITES, { waitUntil: 'domcontentloaded' } );
		await dismissCookieBanner( page );
	}

	await expect( page ).toHaveURL( /my\.elementor\.com\/websites/ );
	await page.getByText( 'Sites', { exact: true } ).first().waitFor( { state: 'visible', timeout: 60000 } );

	await page.context().storageState( { path: STORAGE_STATE } );
} );

function isLoggedInToMyElementor( url: string ): boolean {
	return url.includes( 'my.elementor.com' ) && ! url.includes( '/login' );
}

async function dismissCookieBanner( page: Page ) {
	const allowAll = page.getByRole( 'button', { name: /Allow all/i } );
	if ( await allowAll.isVisible().catch( () => false ) ) {
		await allowAll.click();
	}
}

async function completeOktaStep( page: Page ) {
	if ( await page.getByRole( 'textbox', { name: 'Username' } ).isVisible().catch( () => false ) ) {
		await page.getByRole( 'textbox', { name: 'Username' } ).fill( process.env.OKTA_USERNAME! );
		await page.getByRole( 'button', { name: 'Next' } ).click();
		await page.getByRole( 'textbox', { name: 'Password' } ).fill( process.env.OKTA_PASSWORD! );
		await page.getByRole( 'button', { name: 'Verify' } ).click();
		return;
	}

	if ( await page.getByRole( 'heading', { name: /Verify it's you with a security method/i } ).isVisible().catch( () => false ) ) {
		await completeMfaChallenge( page );
	}
}

async function completeMfaChallenge( page: Page ) {
	const googleAuthenticatorSelect = page.getByRole( 'link', {
		name: /Select Google Authenticator/i,
	} );
	const oktaVerifyEnterCode = page.getByRole( 'link', {
		name: /Select to enter a code from the Okta Verify app/i,
	} );

	if ( await googleAuthenticatorSelect.isVisible().catch( () => false ) ) {
		await googleAuthenticatorSelect.click();
	} else if ( await oktaVerifyEnterCode.isVisible().catch( () => false ) ) {
		await oktaVerifyEnterCode.click();
	} else {
		throw new Error( 'No supported MFA method found (expected Google Authenticator or Okta Verify).' );
	}

	await page.getByRole( 'heading', { name: /Enter a code|Verify with Google Authenticator/i } ).waitFor( {
		timeout: 15000,
	} );

	const totp = new OTPAuth.TOTP( {
		issuer: 'Okta',
		label: process.env.OKTA_USERNAME,
		algorithm: 'SHA1',
		digits: 6,
		period: TOTP_PERIOD_SECONDS,
		secret: getOktaTotpSecret()!,
	} );

	const totpInput = page.getByRole( 'textbox', { name: /Enter code/i } )
		.or( page.locator( 'input[name="credentials.passcode"], input[name="credentials.totp"], input[name="answer"]' ) );

	const invalidCodeMessage = page.getByText( /Invalid code|doesn't match our records/i );
	const mfaFormHeading = page.getByRole( 'heading', {
		name: /Verify with Google Authenticator|Enter a code from Okta Verify/i,
	} );

	await expect( async () => {
		await totpInput.fill( await generateTotpForSubmission( totp ) );
		await page.getByRole( 'button', { name: 'Verify' } ).click();
		await expect( invalidCodeMessage ).toBeHidden( { timeout: 8000 } );
		await expect( mfaFormHeading ).toBeHidden( { timeout: 15000 } );
	} ).toPass( {
		timeout: 90000,
	} );
}

function getSecondsUntilNextTotpWindow( periodSeconds: number ): number {
	const nowSeconds = Math.floor( Date.now() / 1000 );
	const elapsedInWindow = nowSeconds % periodSeconds;

	return periodSeconds - elapsedInWindow;
}

async function waitForFreshTotpWindow(
	periodSeconds: number,
	minRemainingSeconds: number,
): Promise<void> {
	const secondsUntilRollover = getSecondsUntilNextTotpWindow( periodSeconds );

	if ( secondsUntilRollover >= minRemainingSeconds ) {
		return;
	}

	const waitMs = ( secondsUntilRollover + 1 ) * 1000;

	await new Promise( ( resolve ) => setTimeout( resolve, waitMs ) );
}

async function generateTotpForSubmission( totp: OTPAuth.TOTP ): Promise<string> {
	await waitForFreshTotpWindow( totp.period, TOTP_MIN_REMAINING_SECONDS );

	return totp.generate();
}

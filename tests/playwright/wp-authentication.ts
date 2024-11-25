import { APIRequest, APIRequestContext, Page, chromium, APIResponse } from '@playwright/test';

export async function login( apiRequest: APIRequest, user: string, password: string, baseUrl: string ) {
	// Important: make sure we authenticate in a clean environment by unsetting storage state.
	const context = await apiRequest.newContext( { storageState: undefined } );

	await context.post( `${ baseUrl }/wp-login.php`, {
		form: {
			log: user,
			pwd: password,
			'wp-submit': 'Log In',
			redirect_to: `${ baseUrl }/wp-admin/`,
			testcookie: '1',
		},
	} );
	return context;
}

export async function fetchNonce( context: APIRequestContext, baseUrl: string ) {
	const response = await context.get( `${ baseUrl }/wp-admin/post-new.php` );

	await validateResponse( response, 'Failed to fetch page' );

	let pageText = await response.text();
	if ( pageText.includes( 'WordPress has been updated!' ) ) {
		pageText = await updateDatabase( context, baseUrl );
	}

	const nonceMatch = pageText.match( /var wpApiSettings = .*;/ );
	if ( ! nonceMatch ) {
		throw new Error( `Nonce not found on the page:\n"${ pageText }"` );
	}

	return nonceMatch[ 0 ].replace( /^.*"nonce":"([^"]*)".*$/, '$1' );
}

async function updateDatabase( context: APIRequestContext, baseUrl: string ): Promise<string> {
	const browser = await chromium.launch();
	const browserContext = await browser.newContext();
	const page: Page = await browserContext.newPage();
	await page.goto( `${ baseUrl }/wp-admin/post-new.php` );
	await page.getByText( 'Update WordPress Database' ).click();
	await page.getByText( 'Continue' ).click();

	const retryResponse = await context.get( `${ baseUrl }/wp-admin/post-new.php` );

	const pageText = await retryResponse.text();
	await browser.close();
	return pageText;
}

async function validateResponse( response: APIResponse, errorMessage: string ) {
	if ( ! response.ok() ) {
		throw new Error( `
            ${ errorMessage }: ${ response.status }.
            ${ await response.text() }
            ${ response.url() }
        ` );
	}
}

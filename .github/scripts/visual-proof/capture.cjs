'use strict';

const { launchRecordedBrowser, waitForWpFrame, addCaption, clickFirstInWp, saveRecording, screenshot, overlayText, log } = require( './playground.cjs' );

const PLAYGROUND_URL = process.env.PLAYGROUND_URL || '';
const MAX_SHOTS = 3;

async function main() {
	log( `fallback walk PLAYGROUND_URL present=${ Boolean( PLAYGROUND_URL ) }` );

	if ( ! PLAYGROUND_URL ) {
		throw new Error( 'PLAYGROUND_URL is required' );
	}

	const caption = overlayText();
	const { browser, page } = await launchRecordedBrowser();
	const shots = [];

	try {
		log( 'start goto' );
		await page.goto( PLAYGROUND_URL, { waitUntil: 'domcontentloaded', timeout: 120000 } );
		log( 'goto done' );
		await waitForWpFrame( page );
		await addCaption( page, caption );
		await page.waitForTimeout( 1000 );

		await screenshot( page, shots, 'wp-admin', MAX_SHOTS );

		await clickFirstInWp( page, 'link', 'Pages' );
		await page.waitForTimeout( 2000 );
		await waitForWpFrame( page );
		await screenshot( page, shots, 'pages', MAX_SHOTS );

		const openedEditor = await clickFirstInWp( page, 'link', 'Add New' ) || await clickFirstInWp( page, 'link', 'Add New Page' );
		if ( openedEditor ) {
			await page.waitForTimeout( 2000 );
			await clickFirstInWp( page, 'button', 'Edit with Elementor' ) || await clickFirstInWp( page, 'link', 'Edit with Elementor' );
			await page.waitForTimeout( 8000 );
			await waitForWpFrame( page );
			await screenshot( page, shots, 'elementor-editor', MAX_SHOTS );
		} else {
			log( 'click Add New / Add New Page fail; skipping editor shot' );
		}
	} finally {
		try {
			await saveRecording( page );
		} catch ( videoError ) {
			console.error( `[visual-proof:capture] video save failed: ${ videoError.message || videoError }` );
		}
		await browser.close();
	}

	log( `final shot count=${ shots.length }` );
	if ( 0 === shots.length ) {
		throw new Error( 'No screenshots were captured (zero PNG files written)' );
	}
}

main().catch( ( error ) => {
	console.error( `[visual-proof:capture] ${ error.message || error }` );
	console.error( error );
	process.exit( 1 );
} );

'use strict';

const { chromium } = require( 'playwright' );
const fs = require( 'fs' );
const path = require( 'path' );

const OUT_DIR = process.env.VISUAL_PROOF_OUT_DIR || 'visual-proof-shots';
const PLAYGROUND_URL = process.env.PLAYGROUND_URL || '';
const BROKEN_CAPTION = process.env.VISUAL_PROOF_BROKEN || '';
const MAX_SHOTS = 3;

async function waitForWpFrame( page ) {
	for ( let attempt = 0; attempt < 45; attempt++ ) {
		const frame = page.frame( { name: 'wp' } );
		if ( frame ) {
			const url = frame.url();
			const looksReady = url.includes( '/scope:' ) || url.includes( 'wp-admin' ) || url.includes( 'wp-login' );
			if ( looksReady ) {
				const hasBody = await frame.evaluate( () => Boolean( document.body && document.body.innerHTML.length > 20 ) ).catch( () => false );
				if ( hasBody ) {
					return frame;
				}
			}
		}
		await page.waitForTimeout( 2000 );
	}

	throw new Error( 'Playground WordPress frame did not become ready' );
}

async function addCaption( page, text ) {
	if ( ! text ) {
		return;
	}

	await page.evaluate( ( caption ) => {
		let bar = document.getElementById( 'e-visual-proof-caption' );
		if ( ! bar ) {
			bar = document.createElement( 'div' );
			bar.id = 'e-visual-proof-caption';
			bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;padding:12px 16px;background:#1f2937;color:#fff;font:14px/1.4 sans-serif;';
			document.body.appendChild( bar );
		}
		bar.textContent = caption;
	}, text );
}

async function clickFirst( frame, role, name ) {
	const locator = frame.getByRole( role, { name, exact: false } );
	if ( 0 === await locator.count() ) {
		return false;
	}
	await locator.first().click( { timeout: 15000 } );
	return true;
}

async function clickFirstInWp( page, role, name ) {
	const frame = await waitForWpFrame( page );
	return clickFirst( frame, role, name );
}

async function main() {
	if ( ! PLAYGROUND_URL ) {
		throw new Error( 'PLAYGROUND_URL is required' );
	}

	fs.mkdirSync( OUT_DIR, { recursive: true } );

	const browser = await chromium.launch( { headless: true } );
	const page = await browser.newPage( { viewport: { width: 1440, height: 900 } } );
	const shots = [];

	try {
		await page.goto( PLAYGROUND_URL, { waitUntil: 'domcontentloaded', timeout: 120000 } );
		await waitForWpFrame( page );
		await addCaption( page, BROKEN_CAPTION || 'Playground ready' );
		await page.waitForTimeout( 1000 );

		const shot = async ( name ) => {
			if ( shots.length >= MAX_SHOTS ) {
				return;
			}
			const file = path.join( OUT_DIR, `${ String( shots.length + 1 ).padStart( 2, '0' ) }-${ name }.png` );
			await page.screenshot( { path: file, fullPage: false } );
			shots.push( file );
		};

		await shot( 'wp-admin' );

		await clickFirstInWp( page, 'link', 'Pages' );
		await page.waitForTimeout( 2000 );
		await waitForWpFrame( page );
		await shot( 'pages' );

		const openedEditor = await clickFirstInWp( page, 'link', 'Add New' ) || await clickFirstInWp( page, 'link', 'Add New Page' );
		if ( openedEditor ) {
			await page.waitForTimeout( 2000 );
			await clickFirstInWp( page, 'button', 'Edit with Elementor' ) || await clickFirstInWp( page, 'link', 'Edit with Elementor' );
			await page.waitForTimeout( 8000 );
			await waitForWpFrame( page );
			await shot( 'elementor-editor' );
		}
	} finally {
		await browser.close();
	}

	if ( 0 === shots.length ) {
		throw new Error( 'No screenshots were captured' );
	}

	console.log( `Captured ${ shots.length } screenshot(s) in ${ OUT_DIR }` );
}

main().catch( ( error ) => {
	console.error( error.message || error );
	process.exit( 1 );
} );

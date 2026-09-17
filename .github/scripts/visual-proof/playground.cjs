'use strict';

const { chromium } = require( 'playwright' );
const fs = require( 'fs' );
const path = require( 'path' );

const OUT_DIR = process.env.VISUAL_PROOF_OUT_DIR || 'visual-proof-shots';
const OVERLAY_FILE = process.env.VISUAL_PROOF_OVERLAY_FILE || '';
const BROKEN_CAPTION = process.env.VISUAL_PROOF_BROKEN || '';

function log( message ) {
	console.log( `[visual-proof:play] ${ message }` );
}

function overlayText() {
	if ( OVERLAY_FILE && fs.existsSync( OVERLAY_FILE ) ) {
		const fromFile = fs.readFileSync( OVERLAY_FILE, 'utf8' ).trim();
		if ( fromFile ) {
			return fromFile;
		}
	}
	return BROKEN_CAPTION || 'Playground ready';
}

async function waitForWpFrame( page ) {
	for ( let attempt = 0; attempt < 45; attempt++ ) {
		const frame = page.frame( { name: 'wp' } );
		if ( frame ) {
			const url = frame.url();
			const looksReady = url.includes( '/scope:' ) || url.includes( 'wp-admin' ) || url.includes( 'wp-login' );
			if ( looksReady ) {
				const hasBody = await frame.evaluate( () => Boolean( document.body && document.body.innerHTML.length > 20 ) ).catch( () => false );
				if ( hasBody ) {
					log( `frame ready attempt=${ attempt + 1 } url=${ url }` );
					return frame;
				}
			}
		}
		await page.waitForTimeout( 2000 );
	}

	throw new Error( 'Playground WordPress frame did not become ready after 45 attempts' );
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
			bar.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;padding:12px 16px;background:#1f2937;color:#fff;font:14px/1.4 sans-serif;white-space:pre-wrap;max-height:28%;overflow:hidden;';
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
	const ok = await clickFirst( frame, role, name );
	log( `click role=${ role } name=${ name } ${ ok ? 'success' : 'fail' }` );
	return ok;
}

async function launchRecordedBrowser() {
	fs.mkdirSync( OUT_DIR, { recursive: true } );
	const videoDir = path.join( OUT_DIR, 'video-raw' );
	fs.mkdirSync( videoDir, { recursive: true } );
	const browser = await chromium.launch( { headless: true } );
	const context = await browser.newContext( {
		viewport: { width: 1440, height: 900 },
		recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
	} );
	const page = await context.newPage();
	return { browser, context, page };
}

async function saveRecording( page ) {
	const context = page.context();
	const video = page.video();
	await page.close();
	await context.close();
	if ( ! video ) {
		log( 'video recorder not attached' );
		return;
	}

	const rawPath = await video.path();
	if ( ! rawPath || ! fs.existsSync( rawPath ) ) {
		log( 'video file missing after context close' );
		return;
	}

	const dest = path.join( OUT_DIR, 'visual-proof.webm' );
	fs.copyFileSync( rawPath, dest );
	log( `video path=${ dest }` );
}

async function screenshot( page, shots, name, maxShots ) {
	const cap = maxShots || 6;
	if ( shots.length >= cap ) {
		log( `screenshot skipped name=${ name } (max ${ cap })` );
		return;
	}
	const file = path.join( OUT_DIR, `${ String( shots.length + 1 ).padStart( 2, '0' ) }-${ name }.png` );
	await page.screenshot( { path: file, fullPage: false } );
	shots.push( file );
	log( `screenshot path=${ file }` );
}

module.exports = {
	OUT_DIR,
	log,
	overlayText,
	waitForWpFrame,
	addCaption,
	clickFirstInWp,
	launchRecordedBrowser,
	saveRecording,
	screenshot,
};

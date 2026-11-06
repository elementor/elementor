import _path from 'path';
import { expect, type Page } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { wpCli } from '../../../assets/wp-cli';

/**
 * WordPress 7.2 loads its client-side upload pipeline (`media-frame-upload`) in every
 * wp.media frame on a page that sends Document-Isolation-Policy, which the Elementor
 * editor does. The pipeline rejects SVG and JSON in the browser and uploads images
 * through the REST API instead of `async-upload.php`. The editor dequeues
 * `media-frame-upload`, so every upload from the editor media modal must stay on the
 * classic uploader. On WordPress versions without the pipeline this holds trivially.
 */

type Attachment = { get: ( key: string ) => string | number | boolean | undefined };

type MediaFrame = {
	on: ( event: string, callback: () => void ) => void;
	open: () => void;
	state: () => { get: ( key: 'selection' ) => { first: () => Attachment | undefined } };
	uploader: { uploader: { param: ( key: string, value: string ) => void } };
};

declare global {
	interface Window {
		wp: {
			media: {
				( options: Record<string, unknown> ): MediaFrame;
				frame?: MediaFrame;
				controller: { Library: new ( options: Record<string, unknown> ) => unknown };
				query: ( args: Record<string, unknown> ) => unknown;
			};
		};
		_wpPluploadSettings: { defaults: { filters: { mime_types: { extensions: string }[] } } };
		_wpMediaUploadPipelineSettings?: unknown;
	}
}

const RESOURCES = _path.resolve( __dirname, '../../../resources' );

type UploadRequests = { classic: number; rest: number; mimes: string[] };

function trackUploadRequests( page: Page ): UploadRequests {
	const requests: UploadRequests = { classic: 0, rest: 0, mimes: [] };

	page.on( 'response', async ( response ) => {
		if ( ! response.url().includes( '/wp-admin/async-upload.php' ) || 'POST' !== response.request().method() ) {
			return;
		}

		const body = await response.json().catch( () => null );

		if ( body?.success && body.data?.mime ) {
			requests.mimes.push( body.data.mime );
		}
	} );

	page.on( 'request', ( request ) => {
		if ( 'POST' !== request.method() ) {
			return;
		}

		const url = request.url();

		if ( url.includes( '/wp-admin/async-upload.php' ) ) {
			requests.classic++;
		} else if ( /\/wp\/v2\/media(\/|\?|$)/.test( url ) || url.includes( 'rest_route=%2Fwp%2Fv2%2Fmedia' ) ) {
			requests.rest++;
		}
	} );

	return requests;
}

async function expectUploaded( page: Page, requests: UploadRequests, mime: string ): Promise<void> {
	const errors = page.locator( '.media-modal .upload-error-message' );

	await expect.poll( async () => {
		if ( await errors.count() ) {
			return 'error: ' + ( await errors.allInnerTexts() ).join( ' | ' );
		}

		if ( requests.rest ) {
			return 'uploaded through the REST API';
		}

		return requests.mimes.join( ',' ) || 'pending';
	}, { timeout: 60_000 } ).toBe( mime );

	expect( requests.classic ).toBeGreaterThanOrEqual( 1 );
	expect( requests.rest ).toBe( 0 );
}

async function logEnvironment( page: Page, testInfo: { annotations: { type: string; description: string }[] } ): Promise<void> {
	const env = await page.evaluate( () => ( {
		crossOriginIsolated: window.crossOriginIsolated,
		pipelineSettings: 'undefined' !== typeof window._wpMediaUploadPipelineSettings,
		frameUploadScript: !! document.querySelector( 'script[src*="media-frame-upload"]' ),
	} ) );

	testInfo.annotations.push( { type: 'environment', description: JSON.stringify( env ) } );
}

async function openImageControlUpload( page: Page ): Promise<void> {
	await page.locator( '.elementor-control-image .elementor-control-media__preview' ).first().click();
	await page.locator( '.media-modal #menu-item-upload' ).click();
}

async function openIconControlSvgUpload( page: Page ): Promise<void> {
	const control = page.locator( '.elementor-control-selected_icon .elementor-control-media__preview' ).first();
	await control.hover();
	await page.getByText( 'Upload SVG' ).first().click();
	await page.locator( '.media-modal #menu-item-upload' ).click();
}

test.describe( 'Editor media modal uploads use the classic uploader @media-upload', () => {
	test.beforeAll( async () => {
		await wpCli( 'wp option update elementor_unfiltered_files_upload 1' );
	} );

	test.afterAll( async () => {
		await wpCli( 'wp option update elementor_unfiltered_files_upload ""' );
	} );

	test( 'JPEG uploads through async-upload.php', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.addWidget( { widgetType: 'image' } );
		await logEnvironment( page, testInfo );
		const requests = trackUploadRequests( page );

		await openImageControlUpload( page );
		await page.locator( '.media-modal input[type="file"]' ).setInputFiles( _path.join( RESOURCES, 'mountain-image.jpeg' ) );

		await expectUploaded( page, requests, 'image/jpeg' );
	} );

	test( 'SVG uploads through async-upload.php', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		await editor.addWidget( { widgetType: 'icon' } );
		await logEnvironment( page, testInfo );
		const requests = trackUploadRequests( page );

		await openIconControlSvgUpload( page );
		await page.locator( '.media-modal input[type="file"]' ).setInputFiles( _path.join( RESOURCES, 'test-svg-wide.svg' ) );

		await expectUploaded( page, requests, 'image/svg+xml' );
	} );

	test( 'JSON uploads through async-upload.php', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.openNewPage();
		await logEnvironment( page, testInfo );
		const requests = trackUploadRequests( page );

		// Core has no widget with a JSON media control (Lottie lives in Pro), so open
		// the frame the way the media control does for `application/json`
		// (initFrame(), setUploadMimeType() and FilesUploadHandler.setUploadTypeCaller()).
		await page.evaluate( () => {
			const filters = window._wpPluploadSettings.defaults.filters.mime_types[ 0 ];
			const extensions = filters.extensions;
			const frame = window.wp.media( {
				frame: 'post',
				type: 'image',
				multiple: false,
				states: [
					new window.wp.media.controller.Library( {
						title: 'Insert Media',
						library: window.wp.media.query( { type: 'application/json' } ),
						multiple: false,
						date: false,
					} ),
				],
			} );

			frame.on( 'ready', () => {
				filters.extensions = 'json';
			} );
			frame.on( 'close', () => {
				filters.extensions = extensions;
			} );
			frame.open();
			frame.uploader.uploader.param( 'uploadTypeCaller', 'elementor-wp-media-upload' );
		} );
		await page.locator( '.media-modal #menu-item-upload' ).click();
		await page.locator( '.media-modal input[type="file"]' ).setInputFiles( _path.join( RESOURCES, 'lottie-test.json' ) );

		await expectUploaded( page, requests, 'application/json' );
	} );
} );

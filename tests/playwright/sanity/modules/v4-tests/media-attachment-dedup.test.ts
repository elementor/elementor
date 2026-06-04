import { resolve } from 'path';
import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import { type Image } from '../../../types/types';

const SAMPLE_IMAGE: Image = {
	title: 'dedup-test-image',
	extension: 'png',
	filePath: resolve( __dirname, '../home/assets/upgrade-free.png' ),
};

const isGetAttachmentRequest = ( url: string, postData: string | null ): boolean => {
	if ( url.includes( 'get-attachment' ) ) {
		return true;
	}

	if ( ! url.includes( 'admin-ajax.php' ) ) {
		return false;
	}

	const payload = postData ?? '';

	return payload.includes( 'action=get-attachment' );
};

const countGetAttachmentRequests = ( requests: { url: string; postData: string | null }[] ): number =>
	requests.filter( ( { url, postData } ) => isGetAttachmentRequest( url, postData ) ).length;

test.describe( 'Media attachment fetch deduplication @v4-media-dedup', () => {
	test( 'Editor reload does not duplicate get-attachment for the same media ID', async ( {
		page,
		apiRequests,
		request,
	}, testInfo ) => {
		test.setTimeout( 180000 );
		const mediaId = await apiRequests.createMedia( request, SAMPLE_IMAGE );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		const imageSettings = {
			image: {
				$$type: 'image',
				value: {
					src: {
						$$type: 'image-src',
						value: {
							id: { $$type: 'image-attachment-id', value: mediaId },
							url: null,
						},
					},
					size: { $$type: 'string', value: 'full' },
				},
			},
		};

		const containerId = await editor.addElement( { elType: 'container' }, 'document' );

		const imageWidgetIds: string[] = [];

		for ( let index = 0; index < 3; index++ ) {
			const widgetId = await editor.addWidget( { widgetType: 'e-image', container: containerId } );
			await editor.applyElementSettings( widgetId, imageSettings );
			imageWidgetIds.push( widgetId );
		}

		await editor.waitForPreviewFrame();

		for ( const widgetId of imageWidgetIds ) {
			await expect( editor.getPreviewFrame().locator( `[data-id="${ widgetId }"] img` ) ).toBeVisible( {
				timeout: 30000,
			} );
		}

		await page.evaluate( async () => {
			await $e.run( 'document/save/update' );
		} );

		const editorUrl = page.url();
		const getAttachmentRequests: { url: string; postData: string | null }[] = [];

		page.on( 'request', ( req ) => {
			getAttachmentRequests.push( {
				url: req.url(),
				postData: 'POST' === req.method() ? req.postData() : null,
			} );
		} );

		await page.reload( { waitUntil: 'load', timeout: 120000 } );

		await editor.waitForPreviewFrame();

		await page.waitForTimeout( 15000 );

		const getAttachmentCount = countGetAttachmentRequests( getAttachmentRequests );

		expect(
			getAttachmentCount,
			`Expected at most one get-attachment request for shared media ID ${ mediaId } after reload, got ${ getAttachmentCount }. Editor URL: ${ editorUrl }`,
		).toBeLessThanOrEqual( 1 );
	} );
} );

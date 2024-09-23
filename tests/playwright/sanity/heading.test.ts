import { expect } from '@playwright/test';
import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorSelectors from '../selectors/editor-selectors';

test( 'Heading widget added using shortcode with non-correct payload', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = await wpAdmin.openNewPage();

	const jsInPayload = '<script>alert(1)</script>',
		payloadRaw = '{"id":"22823c6","elType":"widget","isInner":false,"isLocked":false,"settings":{"content_width":"full","title":"Howdy ' + jsInPayload + 'owdy"},"elements":[],"widgetType":"heading"}',
		payload = Buffer.from( payloadRaw ).toString( 'base64' ),
		testShortcode = '[elementor-element data="' + payload + '"]';

	let alertDetected = false;
	page.on( 'dialog', async ( dialog ) => {
		alertDetected = true;
		await dialog.dismiss();
	} );

	await editor.addWidget( 'shortcode' );
	await page.locator( '.elementor-control-shortcode textarea' ).fill( testShortcode );
	await editor.getPreviewFrame().waitForSelector( EditorSelectors.heading.h2 );

	expect( alertDetected ).toBe( false );
	expect( await editor.getPreviewFrame().locator( EditorSelectors.heading.h2 ).textContent() ).toBe( 'Howdy alert(1)owdy' );
} );

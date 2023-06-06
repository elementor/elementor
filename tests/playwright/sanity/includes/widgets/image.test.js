const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );
import EditorSelectors from '../../../selectors/editor-selectors.js';

async function chooseImage( page, imageTitle ) {
	await page.click( EditorSelectors.media.preview );
	await page.click( 'text=Media Library' );
	await page.waitForSelector( 'text=Insert Media' );
	await page.click( `[aria-label="${ imageTitle }"]` );
	await page.click( '.button.media-button' );
}

test( 'Image size test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	await editor.addWidget( 'image' );
	await chooseImage( page, 'About-Pic-3-1.png' );
	const img = await editor.getPreviewFrame().waitForSelector( 'img' );
	const src = await img.getAttribute( 'src' );
	let regex = new RegExp( /About-Pic-3-1/ );
	expect( regex.test( src ) ).toEqual( true );

	const imageSize = [ 'thumbnail', 'large', 'full' ];
	for ( const id in imageSize ) {
		await wpAdmin.waitForPanel();
		await editor.getPreviewFrame().locator( '[data-widget_type="image.default"] img' ).click();
		await page.locator( 'select[data-setting="image_size"]' ).selectOption( imageSize[ id ] );
		await editor.getPreviewFrame().locator( 'h1.entry-title' ).click();
		regex = new RegExp( `size-${ imageSize[ id ] }` );
		await expect( editor.getPreviewFrame().locator( '[data-widget_type="image.default"] img' ) ).toHaveClass( regex );
		await editor.publishAndViewPage();
		await page.getByRole( 'link', { name: ' Edit with Elementor' } ).click();
	}
} );

test( 'Custom image size test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	await editor.addWidget( 'image' );
	await chooseImage( page, 'About-Pic-3-1.png' );
	await editor.getPreviewFrame().locator( '[data-widget_type="image.default"] img' ).click();
	await page.locator( 'select[data-setting="image_size"]' ).selectOption( 'custom' );
	await page.locator( 'input[data-setting="width"]' ).type( '400' );
	await page.locator( 'input[data-setting="height"]' ).type( '400' );
	const response = page.waitForResponse( /http:\/\/(.*)\/wp-content\/uploads\/elementor\/thumbs\/About-Pic-3-1(.*)/g );
	await page.getByRole( 'button', { name: 'Apply' } ).click();
	await response;

	const imageSize = await editor.getPreviewFrame().locator( '[data-widget_type="image.default"] img' ).boundingBox();
	expect( imageSize.width ).toEqual( 400 );
	expect( imageSize.height ).toEqual( 400 );

	await editor.publishAndViewPage();

	const imageSizePublished = await page.locator( '[data-widget_type="image.default"] img' ).boundingBox();
	expect( imageSizePublished.width ).toEqual( 400 );
	expect( imageSizePublished.height ).toEqual( 400 );
} );

test( 'Lightbox image captions aligned center', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.useElementorCleanPost();
	const previewFrame = editor.getPreviewFrame();

	await test.step( 'Act', async () => {
		await editor.addWidget( 'image' );

		await page.locator( EditorSelectors.media.preview ).click();
		await page.getByRole( 'tab', { name: 'Media Library' } ).click();
		await page.setInputFiles( 'input[type="file"]', './tests/playwright/resources/elementor1.png' );
		await page.locator( '#attachment-details-title' ).fill( 'Elementor Logo (title)' );
		await page.locator( '#attachment-details-description' ).fill( 'WP + Elementor = ❤️ (description)' );
		await page.getByRole( 'button', { name: 'Select', exact: true } ).click();

		await page.getByRole( 'combobox', { name: 'Caption' } ).selectOption( 'attachment' );
		await page.getByRole( 'combobox', { name: 'Link' } ).selectOption( 'file' );
		await page.getByRole( 'combobox', { name: 'Lightbox' } ).selectOption( 'yes' );
		await previewFrame.locator( '.elementor-widget-image' ).click();
		await previewFrame.waitForSelector( '.swiper-zoom-container' );
	} );

	await test.step( 'Assert', async () => {
		const title = previewFrame.locator( '.elementor-slideshow__title' );
		const description = previewFrame.locator( '.elementor-slideshow__description' );
		await expect( title ).toHaveCSS( 'text-align', 'center' );
		await expect( description ).toHaveCSS( 'text-align', 'center' );
	} );
} );

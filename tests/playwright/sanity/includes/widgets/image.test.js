const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );
const EditorPage = require( '../../../pages/editor-page.js' );
import EditorSelectors from '../../../selectors/editor-selectors.js';
import Content from '../../../pages/elementor-panel-tabs/content.js';

test( 'Image size test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = new EditorPage( page, testInfo );
	const contentTab = new Content( page, testInfo );
	const imageTitle = 'About-Pic-3-1';

	await wpAdmin.openNewPage();
	await editor.addWidget( 'image' );
	await contentTab.chooseImage( `${ imageTitle }.png` );

	const imageSize = [ 'thumbnail', 'large', 'full' ];
	for ( const id in imageSize ) {
		await wpAdmin.waitForPanel();
		await contentTab.selectImageSize( EditorSelectors.image.widget, imageSize[ id ] );
		await contentTab.verifyImageSrc( { selector: EditorSelectors.image.image, isPublished: false } );
		await editor.verifyClassInElement( { selector: EditorSelectors.image.image, className: `size-${ imageSize[ id ] }`, isPublished: false } );
		await editor.publishAndViewPage();
		await wpAdmin.waitForPanel();
		await contentTab.verifyImageSrc( { selector: EditorSelectors.image.image, isPublished: true } );
		await editor.verifyClassInElement( { selector: EditorSelectors.image.image, className: `size-${ imageSize[ id ] }`, isPublished: true } );
		await wpAdmin.editWithElementor();
	}
} );

test( 'Custom image size test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = new EditorPage( page, testInfo );
	const contentTab = new Content( page, testInfo );
	const imageTitle = 'About-Pic-3-1';

	await wpAdmin.openNewPage();
	await editor.addWidget( 'image' );
	await contentTab.chooseImage( `${ imageTitle }.png` );
	await contentTab.setCustomImageSize( { selector: EditorSelectors.image.image, imageTitle, width: '400', height: '400' } );
	await editor.verifyImageSize( { selector: EditorSelectors.image.image, width: 400, height: 400, isPublished: false } );
	await editor.publishAndViewPage();
	await editor.verifyImageSize( { selector: EditorSelectors.image.image, width: 400, height: 400, isPublished: true } );
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

const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../../../pages/wp-admin-page.js' );
const EditorPage = require( '../../../pages/editor-page.js' );
const path = require( 'path' );
import EditorSelectors from '../../../selectors/editor-selectors.js';
import Content from '../../../pages/elementor-panel-tabs/content.js';

test.describe( 'Image widget tests @styleguide_image_link', () => {
	const data = [
		{
			widgetTitle: 'image',
			image: EditorSelectors.image.image,
			widget: EditorSelectors.image.widget,
			select: EditorSelectors.image.imageSizeSelect,
		},
		{
			widgetTitle: 'image-box',
			image: EditorSelectors.imageBox.image,
			widget: EditorSelectors.imageBox.widget,
			select: EditorSelectors.imageBox.imageSizeSelect,
		},
	];

	for ( const i in data ) {
		test( `${ data[ i ].widgetTitle }: Image size test`, async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			const editor = new EditorPage( page, testInfo );
			const contentTab = new Content( page, testInfo );
			const imageTitle = 'About-Pic-3-1';

			await wpAdmin.openNewPage();
			await editor.addWidget( data[ i ].widgetTitle );
			await contentTab.chooseImage( `${ imageTitle }.png` );

			const imageSize = [ 'thumbnail', 'large', 'full' ];
			for ( const id in imageSize ) {
				await wpAdmin.waitForPanel();
				await contentTab.selectImageSize(
					{
						widget: data[ i ].widget,
						select: data[ i ].select,
						imageSize: imageSize[ id ],
					} );
				await contentTab.verifyImageSrc( { selector: data[ i ].image, isPublished: false } );
				await editor.verifyClassInElement(
					{
						selector: data[ i ].image,
						className: `size-${ imageSize[ id ] }`,
						isPublished: false,
					} );
				await editor.publishAndViewPage();
				await wpAdmin.waitForPanel();
				await contentTab.verifyImageSrc( { selector: data[ i ].image, isPublished: true } );
				await editor.verifyClassInElement(
					{
						selector: data[ i ].image,
						className: `size-${ imageSize[ id ] }`,
						isPublished: true,
					} );
				await wpAdmin.editWithElementor();
			}
		} );
	}

	for ( const i in data ) {
		test( `${ data[ i ].widgetTitle }: Custom image size test`, async ( { page }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo );
			const editor = new EditorPage( page, testInfo );
			const contentTab = new Content( page, testInfo );
			const imageTitle = 'About-Pic-3-1';

			await wpAdmin.openNewPage();
			await editor.addWidget( data[ i ].widgetTitle );
			await contentTab.chooseImage( `${ imageTitle }.png` );
			await contentTab.setCustomImageSize(
				{
					selector: data[ i ].image,
					select: data[ i ].select,
					imageTitle, width: '300', height: '300',
				} );
			await editor.verifyImageSize( { selector: data[ i ].image, width: 300, height: 300, isPublished: false } );
			await editor.publishAndViewPage();
			await editor.verifyImageSize( { selector: data[ i ].image, width: 300, height: 300, isPublished: true } );
		} );
	}

	test( 'Lightbox image captions aligned center', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = new EditorPage( page, testInfo );
		const contentTab = new Content( page, testInfo );
		const image = 'elementor1.png';
		await wpAdmin.openNewPage();

		await test.step( 'Act', async () => {
			await editor.addWidget( 'image' );
			await page.locator( EditorSelectors.media.preview ).click();
			await page.getByRole( 'tab', { name: 'Media Library' } ).click();
			await page.setInputFiles( 'input[type="file"]', path.resolve( __dirname, `../../../resources/${ image }` ) );
			await page.locator( '#attachment-details-title' ).fill( 'Elementor Logo (title)' );
			await page.locator( '#attachment-details-description' ).fill( 'WP + Elementor = ❤️ (description)' );
			await page.getByRole( 'button', { name: 'Select', exact: true } ).click();

			await contentTab.setCaption( 'attachment' );
			await contentTab.setLinkTo( 'file' );
			await contentTab.setLightBox( 'yes' );
			expect( await editor.getPreviewFrame().locator( EditorSelectors.image.link ).getAttribute( 'data-elementor-open-lightbox' ) ).toEqual( 'yes' );
			await editor.getPreviewFrame().locator( EditorSelectors.image.image ).click( );
			await expect( editor.getPreviewFrame().locator( '.swiper-zoom-container' ) ).toBeVisible();
		} );

		await test.step( 'Assert', async () => {
			const title = editor.getPreviewFrame().locator( '.elementor-slideshow__title' );
			const description = editor.getPreviewFrame().locator( '.elementor-slideshow__description' );
			await expect( title ).toHaveCSS( 'text-align', 'center' );
			await expect( description ).toHaveCSS( 'text-align', 'center' );
		} );
	} );
} );

import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';
import Content from '../../../pages/elementor-panel-tabs/content';

test.describe( 'Image widget tests @styleguide_image_link', () => {
	const data = [
		{
			widgetTitle: 'image-box',
			image: EditorSelectors.imageBox.image,
			widget: EditorSelectors.imageBox.widget,
			select: EditorSelectors.imageBox.imageSizeSelect,
			isVideo: false,
		},
		{
			widgetTitle: 'image',
			image: EditorSelectors.image.image,
			widget: EditorSelectors.image.widget,
			select: EditorSelectors.image.imageSizeSelect,
			isVideo: false,
		},
	];

	for ( const i in data ) {
		test( `${ data[ i ].widgetTitle }: Image size test`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const contentTab = new Content( page, testInfo );
			const imageTitle = 'About-Pic-3-1';

			await wpAdmin.openNewPage();
			await editor.addWidget( data[ i ].widgetTitle );
			await editor.setMediaControlImageValue( 'image', `${ imageTitle }.png` );

			const imageSize = [ 'thumbnail', 'large', 'full' ];
			for ( const id in imageSize ) {
				await editor.waitForPanelToLoad();
				await contentTab.selectImageSize(
					{
						widget: data[ i ].widget,
						select: data[ i ].select,
						imageSize: imageSize[ id ],
					} );
				await contentTab.verifyImageSrc(
					{
						selector: data[ i ].image,
						isPublished: false,
						isVideo: data[ i ].isVideo,
						imageTitle,
					} );
				await editor.verifyClassInElement(
					{
						selector: data[ i ].image,
						className: `size-${ imageSize[ id ] }`,
						isPublished: false,
					} );
				await editor.publishAndViewPage();
				await editor.waitForPanelToLoad();
				await contentTab.verifyImageSrc(
					{
						selector: data[ i ].image,
						isPublished: true,
						isVideo: data[ i ].isVideo,
						imageTitle,
					} );
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
		test( `${ data[ i ].widgetTitle }: Custom image size test`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const contentTab = new Content( page, testInfo );
			const imageTitle = 'About-Pic-3-1';

			await wpAdmin.openNewPage();
			await editor.addWidget( data[ i ].widgetTitle );
			await editor.setMediaControlImageValue( 'image', `${ imageTitle }.png` );
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

	test( 'Test Lightbox', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		const image = 'About-Pic-3-1';

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		const widgetId = await editor.addWidget( 'image' );
		await editor.setMediaControlImageValue( 'image', `${ image }.png` );
		await editor.setSelectControlValue( 'caption_source', 'attachment' );
		await editor.setSelectControlValue( 'link_to', 'file' );
		await editor.setSelectControlValue( 'open_lightbox', 'yes' );
		expect( await editor.getPreviewFrame().locator( EditorSelectors.image.link ).
			getAttribute( 'data-elementor-open-lightbox' ) ).toEqual( 'yes' );
		await editor.getPreviewFrame().locator( EditorSelectors.image.image ).click( );
		await expect( editor.getPreviewFrame().locator( EditorSelectors.image.lightBox ) ).toBeVisible();

		const title = editor.getPreviewFrame().locator( '.elementor-slideshow__title' );
		const description = editor.getPreviewFrame().locator( '.elementor-slideshow__description' );
		await expect( title ).toHaveCSS( 'text-align', 'center' );
		await expect( description ).toHaveCSS( 'text-align', 'center' );

		const imageSrc = await editor.getPreviewFrame().locator( EditorSelectors.image.image ).getAttribute( 'src' );
		await editor.removeElement( widgetId );
		await editor.addWidget( 'heading' );
		await editor.setTextControlValue( 'link', imageSrc );

		await editor.publishAndViewPage();

		await page.locator( EditorSelectors.widget ).locator( 'a' ).click( );

		const maskPageTitle = page.locator( EditorSelectors.pageHeader );
		await expect( page.locator( EditorSelectors.dialog.lightBox ) ).toHaveScreenshot( 'frontend-image-lightbox.png', { mask: [ maskPageTitle ] } );
	} );
} );

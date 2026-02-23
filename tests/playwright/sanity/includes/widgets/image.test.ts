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
		},
		{
			widgetTitle: 'image',
			image: EditorSelectors.image.image,
			widget: EditorSelectors.image.widget,
			select: EditorSelectors.image.imageSizeSelect,
		},
	];

	for ( const i in data ) {
		test( `${ data[ i ].widgetTitle }: Image size test`, async ( { page, apiRequests }, testInfo ) => {
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const contentTab = new Content( page, testInfo );
			const imageTitle = 'About-Pic-3-1';

			await wpAdmin.openNewPage();
			await editor.addWidget( { widgetType: data[ i ].widgetTitle } );
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
			await editor.addWidget( { widgetType: data[ i ].widgetTitle } );

			await editor.waitForPanelToLoad();
			await editor.getPreviewFrame().locator( data[ i ].widget ).waitFor( { state: 'visible' } );

			await editor.setMediaControlImageValue( 'image', `${ imageTitle }.png` );

			await editor.waitForPanelToLoad();
			await contentTab.setCustomImageSize(
				{
					selector: data[ i ].image,
					select: data[ i ].select,
					imageTitle, width: '300', height: '300',
				} );

			await editor.verifyImageSize( { selector: data[ i ].image, width: 300, height: 300, isPublished: false } );
			await editor.publishAndViewPage();

			await page.waitForLoadState( 'domcontentloaded' );
			await page.locator( data[ i ].image ).waitFor( { state: 'visible' } );

			await editor.verifyImageSize( { selector: data[ i ].image, width: 300, height: 300, isPublished: true } );
		} );
	}

	test( 'Test Lightbox', async ( { page, apiRequests }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = new EditorPage( page, testInfo );
		const image = 'About-Pic-3-1';

		await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();
		const widgetId = await editor.addWidget( { widgetType: 'image' } );

		await editor.waitForPanelToLoad();
		await editor.getPreviewFrame().locator( EditorSelectors.image.widget ).waitFor( { state: 'visible' } );

		await editor.setMediaControlImageValue( 'image', `${ image }.png` );

		await editor.setSelectControlValue( 'caption_source', 'attachment' );
		await editor.setSelectControlValue( 'link_to', 'file' );
		await editor.setSelectControlValue( 'open_lightbox', 'yes' );

		await editor.getPreviewFrame().locator( EditorSelectors.image.link ).waitFor( { state: 'visible' } );

		await expect( editor.getPreviewFrame().locator( EditorSelectors.image.link ) )
			.toHaveAttribute( 'data-elementor-open-lightbox', 'yes' );

		await editor.getPreviewFrame().locator( EditorSelectors.image.image ).click( );
		await expect( editor.getPreviewFrame().locator( '.elementor-lightbox' ).first() ).toBeVisible( { timeout: 5000 } );

		const imageSrc = await editor.getPreviewFrame().locator( EditorSelectors.image.image ).getAttribute( 'src' );

		await editor.getPreviewFrame().locator( '.elementor-lightbox' ).first().press( 'Escape' );
		await expect( editor.getPreviewFrame().locator( '.elementor-lightbox' ).first() ).not.toBeVisible();

		await editor.removeElement( widgetId );
		await editor.addWidget( { widgetType: 'heading' } );
		await editor.setTextControlValue( 'link', imageSrc );

		await editor.publishAndViewPage();
		await page.waitForLoadState( 'domcontentloaded' );
		await page.locator( EditorSelectors.widget ).locator( 'a' ).waitFor( { state: 'visible' } );

		await page.locator( EditorSelectors.widget ).locator( 'a' ).click( );

		await page.locator( EditorSelectors.dialog.lightBox ).waitFor( { state: 'visible', timeout: 5000 } );

		const maskPageTitle = page.locator( EditorSelectors.pageHeader );
		await expect( page.locator( EditorSelectors.dialog.lightBox ) ).toHaveScreenshot( 'frontend-image-lightbox.png', { mask: [ maskPageTitle ] } );
	} );
} );

import { parallelTest as test } from '../parallelTest';
import WpAdminPage from '../pages/wp-admin-page';
import EditorSelectors from '../selectors/editor-selectors';
import Content from '../pages/elementor-panel-tabs/content';
import ImageCarousel from '../pages/widgets/image-carousel';

test.describe( 'Testing link control for widgets: @styleguide_image_link', () => {
	const data = [
		{ title: 'heading', selector: EditorSelectors.heading.link, linkTo: false },
		{ title: 'button', selector: EditorSelectors.button.getByName( 'Click here' ), linkTo: false },
		{ title: 'icon', selector: EditorSelectors.icon.link, linkTo: false },
		{ title: 'image', selector: EditorSelectors.image.link, linkTo: true },
		{ title: 'image-box', selector: EditorSelectors.imageBox.link, linkTo: false },
		{ title: 'image-carousel', selector: EditorSelectors.imageCarousel.link, linkTo: true },
		{ title: 'social-icons', selector: EditorSelectors.socialIcons.link, linkTo: false },
		{ title: 'text-path', selector: EditorSelectors.textPath.link, linkTo: false },
	];

	for ( const widget in data ) {
		test.skip( `Verify ${ data[ widget ].title } link control`, async ( { page, apiRequests }, testInfo ) => {
			const link = 'https://elementor.com/';
			const customAttributes = { key: 'mykey', value: 'myValue' };
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
			const imageCarousel = new ImageCarousel( page, testInfo );
			const editor = await wpAdmin.openNewPage();
			const contentTab = new Content( page, testInfo );

			await editor.addWidget( data[ widget ].title );
			if ( 'image-carousel' === data[ widget ].title ) {
				await imageCarousel.addImageGallery();
				await editor.openSection( 'section_additional_options' );
				await editor.setSwitcherControlValue( 'autoplay', false );
				await editor.openSection( 'section_image_carousel' );
			}

			if ( 'social-icons' === data[ widget ].title ) {
				await page.locator( EditorSelectors.item ).first().click();
			}

			await contentTab.setLink( link,
				{ targetBlank: true, noFollow: true, customAttributes, linkTo: data[ widget ].linkTo, linkInpSelector: EditorSelectors.button.url } );
			const widgetInEditor = editor.getPreviewFrame().locator( data[ widget ].selector ).first();
			await contentTab.verifyLink( widgetInEditor,
				{ target: '_blank', href: link, rel: 'nofollow', customAttributes, widget: data[ widget ].title } );
			await editor.publishAndViewPage();
			const publishedWidget = page.locator( data[ widget ].selector ).first();
			await contentTab.verifyLink( publishedWidget,
				{ target: '_blank', href: link, rel: 'nofollow', customAttributes, widget: data[ widget ].title } );
		} );
	}
} );

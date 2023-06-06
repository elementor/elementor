import { test } from '@playwright/test';
import WpAdminPage from '../pages/wp-admin-page.js';
import EditorSelectors from '../selectors/editor-selectors.js';
import Content from '../pages/elementor-panel-tabs/content.js';

const data = [
	{ title: 'heading', selector: EditorSelectors.heading.link, linkTo: false },
	{ title: 'button', selector: EditorSelectors.button.getByName( 'Click here' ), linkTo: false },
	{ title: 'icon', selector: EditorSelectors.icon.link, linkTo: false },
	{ title: 'image', selector: EditorSelectors.image.link, linkTo: true },
	{ title: 'image-box', selector: EditorSelectors.imageBox.link, linkTo: false },
	// BUG here !{ title: 'text-path', selector: EditorSelectors.textPath.link, linkTo: false },
];

for ( const widget in data ) {
	test( `Verify ${ data[ widget ].title } link control`, async ( { page }, testInfo ) => {
		const link = 'https://elementor.com/';
		const customAttributes = { key: 'mykey', value: 'myValue' };
		const wpAdmin = new WpAdminPage( page, testInfo );
		const editor = await wpAdmin.openNewPage();
		const contentTab = new Content( page, testInfo );

		await editor.addWidget( data[ widget ].title );
		await contentTab.setLink( link, { targetBlank: true, noFollow: true, customAttributes, linkTo: data[ widget ].linkTo } );
		const widgetInEditor = editor.getPreviewFrame().locator( data[ widget ].selector ).first();
		await contentTab.verifyLink( widgetInEditor, { target: '_blank', href: link, rel: 'nofollow', customAttributes } );
		await editor.publishAndViewPage();
		const publishedWidget = page.locator( data[ widget ].selector ).first();
		await contentTab.verifyLink( publishedWidget, { target: '_blank', href: link, rel: 'nofollow', customAttributes } );
	} );
}

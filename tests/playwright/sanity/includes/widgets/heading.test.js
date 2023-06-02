import { test } from '@playwright/test';
import WpAdminPage from '../../../pages/wp-admin-page.js';
import EditorSelectors from '../../../selectors/editor-selectors.js';
import Content from '../../../pages/elementor-panel-tabs/content.js';

test( 'Verify heading link control', async ( { page }, testInfo ) => {
	const link = 'https://elementor.com/';
	const customAttributes = { key: 'mykey', value: 'myValue' };
	const wpAdmin = new WpAdminPage( page, testInfo );
	const editor = await wpAdmin.openNewPage();
	const contentTab = new Content( page, testInfo );

	await editor.addWidget( 'heading' );
	await contentTab.setLink( link, { targetBlank: true, noFollow: true, customAttributes } );
	await editor.publishAndViewPage();
	const publishedHeading = page.locator( EditorSelectors.heading.link );
	await contentTab.verifyLink( publishedHeading, { target: '_blank', href: link, rel: 'nofollow', customAttributes } );
} );

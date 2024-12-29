import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import Content from '../../../pages/elementor-panel-tabs/content';
import EditorSelectors from '../../../selectors/editor-selectors';

test( 'Custom path type', async ( { page, apiRequests }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = new EditorPage( page, testInfo );
	const contentTab = new Content( page, testInfo );
	await wpAdmin.enableAdvancedUploads();
	await wpAdmin.openNewPage();
	await editor.closeNavigatorIfOpen();
	await editor.addWidget( 'text-path' );
	await editor.setSelectControlValue( 'path', 'custom' );
	await contentTab.uploadSVG( { widget: 'text-path' } );
	await expect( editor.getPreviewFrame().locator( EditorSelectors.textPath.svgIcon ) ).toBeVisible();
	await editor.publishAndViewPage();
	await expect( page.locator( EditorSelectors.textPath.svgIcon ) ).toBeVisible();
} );

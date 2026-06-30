import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import EditorPage from '../../../pages/editor-page';
import EditorSelectors from '../../../selectors/editor-selectors';

test( 'Custom path type', async ( { page, apiRequests }, testInfo ) => {
	// Arrange.
	const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
	const editor = new EditorPage( page, testInfo );

	await wpAdmin.enableAdvancedUploads();
	await wpAdmin.openNewPage();
	await editor.closeNavigatorIfOpen();

	// Act.
	await editor.addWidget( { widgetType: 'text-path' } );
	await editor.setSelectControlValue( 'path', 'custom' );
	await page.locator( '.elementor-control-custom_path .eicon-plus-circle' ).click();
	await editor.uploadSVG();

	// Assert.
	await expect( editor.getPreviewFrame().locator( EditorSelectors.textPath.svgIcon ) ).toBeVisible();
	await editor.publishAndViewPage();
	await expect( page.locator( EditorSelectors.textPath.svgIcon ) ).toBeVisible();
} );

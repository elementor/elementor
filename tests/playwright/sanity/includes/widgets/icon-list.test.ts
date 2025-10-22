import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';
import _path from 'path';

test.describe( 'Icon List widget tests', () => {
	test( 'Test icon list alignment of list items', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setSiteLanguage( '' );

		const editor = await wpAdmin.openNewPage();
		await editor.closeNavigatorIfOpen();

		// Act.
		const filePath = _path.resolve( __dirname, `./../../templates/icon-list.json` );
		await editor.loadTemplate( filePath, false );

		const pageId = await editor.getPageId();
		await editor.publishAndViewPage();

		// Assert.
		await test.step( 'LTR layouts', async () => {
			const iconBoxes = page.locator( '.e-con-inner' ).first();
			await iconBoxes.waitFor();
			await expect.soft( iconBoxes ).toHaveScreenshot( 'icon-list-items-alignment-ltr.png' );
		} );

		await test.step( 'RTL layouts', async () => {
			await wpAdmin.setSiteLanguage( 'he_IL' );

			await editor.page.goto( `/?p=${ pageId }` );
			await editor.page.waitForLoadState();

			const iconBoxes = page.locator( '.e-con-inner' ).first();
			await iconBoxes.waitFor();
			await expect.soft( iconBoxes ).toHaveScreenshot( 'icon-list-items-alignment-rtl.png' );
		} );

		await wpAdmin.setSiteLanguage( '' );
	} );

	test( 'Test vertical alignment of the icons', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( { widgetType: 'icon-list' } );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_icon_style' );
		await editor.setChooseControlValue( 'icon_self_vertical_align', 'eicon-v-align-top' );
		await editor.setSliderControlValue( 'icon_vertical_offset', '10' );

		// Assert.
		await expect( editor.getPreviewFrame().locator( '.elementor-icon-list-item' ).first() ).toHaveCSS( 'align-items', 'flex-start' );
		await expect( editor.getPreviewFrame().locator( '.elementor-icon-list-icon' ).first() ).toHaveCSS( 'top', '10px' );
	} );
} );

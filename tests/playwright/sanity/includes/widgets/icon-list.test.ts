import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../parallelTest';
import WpAdminPage from '../../../pages/wp-admin-page';

test.describe( 'Icon List', () => {
	test( 'Test vertical alignment of the icons', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act.
		await editor.addWidget( 'icon-list' );
		await editor.openPanelTab( 'style' );
		await editor.openSection( 'section_icon_style' );
		await editor.setChooseControlValue( 'icon_self_vertical_align', 'eicon-v-align-top' );
		await editor.setSliderControlValue( 'icon_vertical_offset', '10' );

		// Assert.
		await expect( editor.getPreviewFrame().locator( '.elementor-icon-list-item' ).first() ).toHaveCSS( 'align-items', 'flex-start' );
		await expect( editor.getPreviewFrame().locator( '.elementor-icon-list-icon' ).first() ).toHaveCSS( 'top', '10px' );
	} );
} );

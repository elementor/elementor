import { expect } from '@playwright/test';
import { disablePromotionCdn } from '../../../../assets/disable-promotion-cdn';
import { parallelTest as test } from '../../../../parallelTest';
import EditorSelectors from '../../../../selectors/editor-selectors';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Editor tests', () => {
	test( 'Check that app-bar exists', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const appBar = editor.page.locator( EditorSelectors.panels.topBar.wrapper );

		// Act
		await editor.closeNavigatorIfOpen();
		await editor.openPageSettingsPanel();
		await editor.setTextControlValue( 'post_title', 'Playwright Test Page' );
		await appBar.getByRole( 'button', { name: 'Playwright Test Page' } ).waitFor();
		await editor.openUserPreferencesPanel();
		await editor.isUiStable( appBar, 5 );

		await appBar.locator( '.MuiBadge-badge' ).evaluateAll( ( badges ) => {
			badges.forEach( ( badge ) => {
				( badge as HTMLElement ).style.visibility = 'hidden';
			} );
		} );

		// Assert
		expect.soft( await appBar.screenshot( {
			type: 'jpeg',
			quality: 70,
			mask: [
				appBar.getByRole( 'button', { name: 'Angie' } ),
			],
		} ) ).toMatchSnapshot( 'editor-app-bar.jpg', { maxDiffPixels: 100 } );
	} );

	test( 'Check for panel styles', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		await disablePromotionCdn();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act
		await editor.openElementsPanel();

		const panel = editor.page.locator( 'aside#elementor-panel' );

		// Assert
		expect.soft( await panel.screenshot( {
			type: 'jpeg',
			quality: 70,
			mask: [
				editor.page.locator( '.e-widget-new-badge' ),
				editor.page.locator( '#elementor-panel-get-pro-elements-sticky' ),
				editor.page.locator( '.e-ai-button' ),
				editor.page.locator( '.e-ai-layout-button' ),
			],
		} ) ).toMatchSnapshot( 'editor-panel.jpg', { maxDiffPixels: 100 } );
	} );
} );

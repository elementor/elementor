import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import EditorSelectors from '../../../../selectors/editor-selectors';
import WpAdminPage from '../../../../pages/wp-admin-page';

test.describe( 'Editor tests', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await page.close();
	} );

	test( 'Check that app-bar exists', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();
		const appBar = editor.page.locator( EditorSelectors.panels.topBar.wrapper );

		// Act
		await editor.openPageSettingsPanel();
		await editor.setTextControlValue( 'post_title', 'Playwright Test Page' );

		await appBar.getByRole( 'button', { name: 'Playwright Test Page' } ).waitFor();
		await editor.isUiStable( appBar, 5 );

		// Assert
		expect.soft( await appBar.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'editor-app-bar.jpg', { maxDiffPixels: 100 } );
	} );

	test( 'Check for panel styles', async ( { page, apiRequests }, testInfo ) => {
		// Arrange.
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const editor = await wpAdmin.openNewPage();

		// Act
		await editor.openElementsPanel();

		// Assert
		expect.soft( await editor.page.locator( 'aside#elementor-panel' ).screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( 'editor-panel.jpg', { maxDiffPixels: 100 } );
	} );
} );

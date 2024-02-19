import { test } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import {expectScreenshotToMatchLocator} from '../../../modules/nested-accordion/helper';
import _path from 'path';

test.describe( 'Icons (FA Brands)', () => {
	test( 'All brand icons are rendering properly', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		await test.step( 'Without the Inline Icons experiment', async () => {
			// Arrange.
			await wpAdmin.setExperiments( {
				e_font_icon_svg: 'inactive',
			} );

			await testIcons( page, testInfo );
		} );

		await test.step( 'With the Inline Icons experiment active', async () => {
			// Arrange.
			await wpAdmin.setExperiments( {
				e_font_icon_svg: 'active',
			} );

			await testIcons( page, testInfo );
		} );
	} );
} );

async function testIcons( page, testInfo ) {
	// Arrange.
	const editorPage = new EditorPage( page, testInfo );
	const frame = editorPage.getPreviewFrame();

	const iconsType = 'icons-brands';

	// Act.
	await editorPage.closeNavigatorIfOpen();
	await editorPage.removeWpAdminBar();

	const filePath = _path.resolve( __dirname, `/${ iconsType }.json` );
	await editorPage.loadTemplate( filePath, true );
	await editorPage.waitForIframeToLoaded( iconsType );

	await page.setViewportSize( { width: 1920, height: 3080 } );
	await editorPage.publishAndViewPage();

	// Assert.
	await expectScreenshotToMatchLocator( 'icons-brands.png', frame.locator( '.e-con-inner' ).first() );
}

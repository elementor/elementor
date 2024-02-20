import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import _path from 'path';

test.describe( 'Icons (FA Brands)', () => {
	test( 'All brand icons are rendering properly', async ( { page }, testInfo ) => {
		const wpAdmin = new WpAdminPage( page, testInfo );

		for ( const status of [ 'inactive', 'active' ] ) {
			await test.step( `Inline Icons experiment status - ${ status }`, async () => {
				await wpAdmin.setExperiments( {
					e_font_icon_svg: status,
				} );

				await testIcons( wpAdmin, page, testInfo );
			} );
		}
	} );
} );

async function testIcons( wpAdmin, page, testInfo ) {
	// Arrange.
	const editorPage = new EditorPage( page, testInfo );
	const frame = editorPage.getPreviewFrame();

	const iconsType = 'icons-brands';

	// Act.
	await wpAdmin.openNewPage();
	await editorPage.closeNavigatorIfOpen();

	const filePath = _path.resolve( __dirname, `../../../../templates/${ iconsType }.json` );
	await editorPage.loadTemplate( filePath, true );
	await editorPage.waitForIframeToLoaded( iconsType );

	await page.setViewportSize( { width: 1920, height: 3080 } );
	await editorPage.publishAndViewPage();

	// Assert.
	expect( await frame
		.locator( '.e-con-inner' ).first()
		.screenshot( { type: 'jpeg', quality: 90 } ) )
		.toMatchSnapshot( `${ iconsType }.png` );
}

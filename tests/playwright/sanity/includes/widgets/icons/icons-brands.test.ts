import { expect, test } from '@playwright/test';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import _path from 'path';

test.describe( 'Icons (FA Brands)', () => {
	for ( const status of [ 'inactive', 'active' ] ) {
		test( `Inline Icons experiment status - ${ status }`, async ( { page }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo );
			const editor = new EditorPage( page, testInfo );
			const iconsType = 'icons-brands';

			// Act.
			await wpAdmin.setExperiments( {
				e_font_icon_svg: status,
			} );

			await wpAdmin.openNewPage();
			await editor.closeNavigatorIfOpen();

			const filePath = _path.resolve( __dirname, `./template/${ iconsType }.json` );
			await editor.loadTemplate( filePath, true );

			await editor.publishAndViewPage();

			// Assert.
			const icons = page.locator( '.e-con-inner' ).first();
			await icons.waitFor();
			await expect.soft( icons ).toHaveScreenshot( `${ iconsType }.png` );
		} );
	}
} );

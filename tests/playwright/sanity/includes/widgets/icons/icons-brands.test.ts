import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import WpAdminPage from '../../../../pages/wp-admin-page';
import EditorPage from '../../../../pages/editor-page';
import _path from 'path';

test.describe( 'Icons (FA Brands)', () => {
	test.beforeAll( async ( { browser, apiRequests }, testInfo ) => {
		const page = await browser.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.resetExperiments();
		await wpAdmin.setExperiments( { container: 'active' } );

		await page.close();
	} );

	for ( const status of [ 'inactive', 'active' ] ) {
		test( `Inline Icons experiment status - ${ status }`, async ( { page, apiRequests }, testInfo ) => {
			// Arrange.
			const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
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

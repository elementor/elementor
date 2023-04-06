import { expect, test } from '@playwright/test';
import _path from 'path';
import WpAdminPage from '../src/pages/wp-admin-page';
import EditorPage from '../src/pages/editor-page';

test.describe( 'Elementor regression tests with templates for CORE', () => {
	test.beforeAll( async ( { browser } ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page );
		await wpAdmin.setExperiments( {
			container: 'active',
		} );
	} );

	const testData = [ 'divider', 'heading', 'text_editor' ];
	for ( const widgetType of testData ) {
		test( `Test ${ widgetType } template`, async ( { page } ) => {
			const filePath = _path.resolve( __dirname, `./templates/${ widgetType }.json` );
			const wpAdminPage = new WpAdminPage( page );
			const editorPage = new EditorPage( page );

			await editorPage.setupElementorPage( wpAdminPage );
			await editorPage.loadTemplate( filePath );
			await editorPage.setElementorEditorPanel( 'Preview' );
			const widgetCount = await editorPage.getWidgetCount();
			for ( let i = 0; i < widgetCount; i++ ) {
				await expect( editorPage.getWidget().nth( i ) ).toHaveScreenshot( `${ widgetType }_${ i }.png` );
			}
			await editorPage.setElementorEditorPanel( 'Back to Editor' );
			await editorPage.publishAndViewPage();
			await page.waitForTimeout( 500 );
			await expect( editorPage.container ).toHaveScreenshot( `${ widgetType }_published.png`, { maxDiffPixels: 100 } );
		} );
	}
} );


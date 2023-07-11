import { expect, test } from '@playwright/test';
import _path from 'path';
import WpAdminPage from '../../playwright/pages/wp-admin-page';
import EditorPage from '../../playwright/pages/editor-page';
import EditorSelectors from '../../playwright/selectors/editor-selectors';
import { createDefaultMedia, deleteDefaultMedia } from '../../playwright/assets/api-requests';

const imageIds = [];
const image2 = {
	title: 'image2',
	extension: 'jpg',
};

test.describe( 'Elementor regression tests with templates for CORE', () => {
	test.beforeAll( async ( { browser, request }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		imageIds.push( await createDefaultMedia( request, image2 ) );
		await wpAdmin.setExperiments( {
			container: 'active',
		} );
	} );

	const testData = [ 'divider', 'heading', 'text_editor', 'button', 'image' ];
	for ( const widgetType of testData ) {
		test( `Test ${ widgetType } template`, async ( { page }, testInfo ) => {
			const filePath = _path.resolve( __dirname, `./templates/${ widgetType }.json` );

			const wpAdminPage = new WpAdminPage( page, testInfo );
			const editorPage = new EditorPage( page, testInfo );
			await wpAdminPage.openNewPage();
			await editorPage.closeNavigatorIfOpen();
			await editorPage.loadTemplate( filePath );

			const widgetCount = await editorPage.getWidgetCount();
			const widgetIds = [];
			for ( let i = 0; i < widgetCount; i++ ) {
				const widget = editorPage.getWidget().nth( i );
				const id = await widget.getAttribute( 'data-id' );
				widgetIds.push( id );
				await editorPage.waitForElementRender( id );
				await expect( widget ).toHaveScreenshot( `${ widgetType }_${ i }.png`, { maxDiffPixels: 100 } );
			}
			await editorPage.publishAndViewPage();
			await editorPage.waitForElementRender( widgetIds[ 0 ] );
			await expect( page.locator( EditorSelectors.container ) ).toHaveScreenshot( `${ widgetType }_published.png`, { maxDiffPixels: 100 } );
		} );
	}

	test.afterAll( async ( { request } ) => {
		await deleteDefaultMedia( request, imageIds );
	} );
} );


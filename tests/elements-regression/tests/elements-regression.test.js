import { expect, test } from '@playwright/test';
import _path from 'path';
import WpAdminPage from '../../playwright/pages/wp-admin-page';
import EditorPage from '../../playwright/pages/editor-page';
import EditorSelectors from '../../playwright/selectors/editor-selectors';

test.describe( 'Elementor regression tests with templates for CORE', () => {
	test.beforeAll( async ( { browser }, testInfo ) => {
		const context = await browser.newContext();
		const page = await context.newPage();
		const wpAdmin = new WpAdminPage( page, testInfo );
		await wpAdmin.setExperiments( {
			container: 'active',
		} );
	} );

	const testData = [
		'divider',
		'heading',
		'text_editor',
		'button',
		'image',
		'icon',
		'image_box',
		'image_carousel',
		'tabs',
		'video',
		'spacer',
		'text_path',
		'social_icons',
		'google_maps',
		'accordion',
		'icon_box',
		'icon_list',
		'star_rating',
		'basic_gallery',
		'counter',
		'progress_bar',
		'testimonial',
		'toggle',
		'sound_cloud',
		'html',
		'alert',
	];

	for ( const widgetType of testData ) {
		test( `Test ${ widgetType } template`, async ( { page }, testInfo ) => {
			const filePath = _path.resolve( __dirname, `./templates/${ widgetType }.json` );

			const wpAdminPage = new WpAdminPage( page, testInfo );
			const editorPage = new EditorPage( page, testInfo );
			await wpAdminPage.openNewPage();
			await editorPage.closeNavigatorIfOpen();
			await editorPage.loadTemplate( filePath );
			await editorPage.waitForIframeToLoaded( widgetType );

			const widgetCount = await editorPage.getWidgetCount();
			const widgetIds = [];
			for ( let i = 0; i < widgetCount; i++ ) {
				const widget = editorPage.getWidget().nth( i );
				const id = await widget.getAttribute( 'data-id' );
				await expect( widget ).not.toHaveClass( /elementor-widget-empty/ );
				widgetIds.push( id );
				await editorPage.waitForElementRender( id );
				await expect( widget ).toHaveScreenshot( `${ widgetType }_${ i }.png`, { maxDiffPixels: 100, timeout: 10000 } );
			}

			const response = page.waitForResponse( /http:\/\/(.*)\/wp-content\/uploads(.*)/g );
			await editorPage.publishAndViewPage();
			await editorPage.waitForElementRender( widgetIds[ 0 ] );
			await editorPage.waitForIframeToLoaded( widgetType, true );
			await response;

			await expect( page.locator( EditorSelectors.container ) ).toHaveScreenshot( `${ widgetType }_published.png`, { maxDiffPixels: 100, timeout: 10000 } );
		} );
	}
} );


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
		'button_hover',
		'image_hover',
		'image_box_hover',
		'icon_hover',
		'social_icons_hover',
		'text_path_hover',
	];

	for ( const widgetType of testData ) {
		test( `Test ${ widgetType } template`, async ( { page }, testInfo ) => {
			const filePath = _path.resolve( __dirname, `./templates/${ widgetType }.json` );
			const hoverSelector = {
				button_hover: 'a',
				image_hover: 'img',
				image_box_hover: 'img',
				icon_hover: '.elementor-icon.elementor-animation-rotate',
				social_icons_hover: '.elementor-social-icon-facebook',
				text_path_hover: 'textPath',
			};

			const wpAdminPage = new WpAdminPage( page, testInfo );
			const editorPage = new EditorPage( page, testInfo );
			await wpAdminPage.openNewPage();
			await editorPage.closeNavigatorIfOpen();
			await editorPage.loadTemplate( filePath, true );
			await editorPage.waitForIframeToLoaded( widgetType );

			const widgetCount = await editorPage.getWidgetCount();
			for ( let i = 0; i < widgetCount; i++ ) {
				const widget = editorPage.getWidget().nth( i );
				await expect( widget ).not.toHaveClass( /elementor-widget-empty/ );

				if ( widgetType.includes( 'hover' ) ) {
					await widget.locator( hoverSelector[ widgetType ] ).hover();
					await expect( widget )
						.toHaveScreenshot( `${ widgetType }_${ i }.png`, { maxDiffPixels: 200, timeout: 10000, animations: 'allow' } );
				} else {
					await expect( widget )
						.toHaveScreenshot( `${ widgetType }_${ i }.png`, { maxDiffPixels: 200, timeout: 10000 } );
				}
			}

			await editorPage.publishAndViewPage();
			await editorPage.waitForIframeToLoaded( widgetType, true );

			if ( widgetType.includes( 'hover' ) ) {
				for ( let i = 0; i < widgetCount; i++ ) {
					await page.locator( `${ EditorSelectors.widget } ${ hoverSelector[ widgetType ] }` ).nth( i ).hover();
					await expect( page.locator( EditorSelectors.widget ).nth( i ) ).
						toHaveScreenshot( `${ widgetType }_${ i }_published.png`, { maxDiffPixels: 200, timeout: 10000, animations: 'allow' } );
				}
			} else {
				await expect( page.locator( EditorSelectors.container ) )
					.toHaveScreenshot( `${ widgetType }_published.png`, { maxDiffPixels: 200, timeout: 10000 } );
			}
		} );
	}
} );

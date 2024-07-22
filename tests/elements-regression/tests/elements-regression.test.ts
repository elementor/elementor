import { parallelTest as test } from '../../playwright/parallelTest';
import _path from 'path';
import WpAdminPage from '../../playwright/pages/wp-admin-page';
import EditorPage from '../../playwright/pages/editor-page';
import ElementRegressionHelper from '../helper';

test.describe( 'Elementor regression tests with templates for CORE', () => {
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
		test( `Test ${ widgetType } template`, async ( { page, apiRequests }, testInfo ) => {
			const filePath = _path.resolve( __dirname, `./templates/${ widgetType }.json` );
			const hoverSelector = {
				button_hover: 'a',
				image_hover: 'img',
				image_box_hover: 'img',
				icon_hover: '.elementor-icon.elementor-animation-rotate',
				social_icons_hover: '.elementor-social-icon-facebook',
				text_path_hover: 'textPath',
			};

			const wpAdminPage = new WpAdminPage( page, testInfo, apiRequests );
			const editor = new EditorPage( page, testInfo );
			const helper = new ElementRegressionHelper( page, testInfo );
			await wpAdminPage.openNewPage();
			await editor.closeNavigatorIfOpen();

			await editor.loadTemplate( filePath, true );
			await editor.waitForIframeToLoaded( widgetType );

			await page.setViewportSize( { width: 1920, height: 3080 } );
			await helper.doScreenshot( widgetType, false );
			await helper.doHoverScreenshot( { widgetType, hoverSelector, isPublished: false } );
			await helper.doResponsiveScreenshot( { device: 'mobile', isPublished: false, widgetType } );
			await helper.doResponsiveScreenshot( { device: 'tablet', isPublished: false, widgetType } );

			await editor.publishAndViewPage();

			await editor.waitForIframeToLoaded( widgetType, true );
			await editor.removeWpAdminBar();
			await page.setViewportSize( { width: 1920, height: 1080 } );
			await helper.doScreenshot( widgetType, true );
			await helper.doHoverScreenshot( { widgetType, hoverSelector, isPublished: true } );
			await helper.doResponsiveScreenshot( { device: 'mobile', isPublished: true, widgetType } );
			await helper.doResponsiveScreenshot( { device: 'tablet', isPublished: true, widgetType } );
		} );
	}
} );

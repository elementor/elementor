const {test, expect} = require('@playwright/test');
const {EditorPage} = require('../pages/editor-page');
const {WpAdminPage} = require('../pages/wp-admin-page');

test('All widgets sanity test', async ({page}) => {
	const wpAdmin = new WpAdminPage(page);
	await wpAdmin.createNewPage();

	const widgets = [
		'accordion',
		'alert',
		'button',
		'divider',
		'heading',
		'icon',
		'icon-box',
		'icon-list',
		'image',
		'image-box',
		'social-icons',
		'spacer',
		'star-rating',
		'tabs',
		'testimonial',
		'text-editor',
		'text-path',
		'toggle',
	];

	const iframeWidgets = [
		'audio',
		'google_maps',
		'video'
	];

	const emptyWidgets = [
		'html',
		'image-carousel',
		'image-gallery',
		'inner-section',
		'menu-anchor',
		'read-more',
		'shortcode',
		'sidebar',
	];

	const animatedWidgets = [
		'counter',
		'progress',
	];

	const wpWidgets = [
		'wp-widget-archives',
		'wp-widget-block',
		'wp-widget-calendar',
		'wp-widget-categories',
		'wp-widget-custom_html',
		'wp-widget-media_audio',
		'wp-widget-media_gallery',
		'wp-widget-media_image',
		'wp-widget-media_video',
		'wp-widget-meta',
		'wp-widget-nav_menu',
		'wp-widget-pages',
		'wp-widget-recent-comments',
		'wp-widget-recent-posts',
		'wp-widget-rss',
		'wp-widget-search',
		'wp-widget-tag_cloud',
		'wp-widget-text',
	];

	const widgetsConfig = {
		heading: {
			controls: {
				"title": {"label": "Title", "type": "textarea"},
				"link": {"label": "Link", "type": "url"},
				"size": {"label": "Size", "type": "select"},
				"header_size": {"label": "HTML Tag", "type": "select"},
				"align": {"label": "Alignment", "type": "choose"},
				"align_tablet": {"label": "Alignment", "type": "choose"},
				"align_mobile": {"label": "Alignment", "type": "choose"},
				"view": {"label": "View", "type": "hidden"},
			}
		}
	};

	const editor = new EditorPage(page);

	await page.evaluate(() => {
		document.getElementById('elementor-notice-bar').remove();
	});

	for (const widgetsName in widgetsConfig) {
		const config = widgetsConfig[widgetsName];

		const widgetId = await editor.addWidget(widgetsName);
		console.log(widgetsName);

		const element = await editor.getFrame().waitForSelector(`.elementor-element-${widgetId}`);
		await page.waitForTimeout(800);

		await element.screenshot({
			type: 'jpeg',
			quality: 70
		}).toMatchSnapshot(`test-screenshots/${widgetsName}.jpeg`)

		for (const controlName in config.controls) {
			const controlConfig = config.controls[controlName];

			// Focus on top frame.
			await page.click(`#elementor-panel-header-title`);

			switch (controlConfig.type) {
				case 'textarea':
					await page.fill(`[data-setting="${controlName}"]`, `${widgetsName} ${controlName} Test`);

					await element.screenshot({
						type: 'jpeg',
						quality: 70
					}).toMatchSnapshot(`test-screenshots/${widgetsName}-${controlName}.jpeg`);

					// Reset.
					await page.fill(`[data-setting="${controlName}"]`, `${widgetsName} Test`);

					break;
				case 'select':
					const options = await page.evaluate((controlName) => {
						const select = document.querySelector(`[data-setting="${controlName}"]`);
						console.log(controlName, select.classNames);
						const values = select.options.map(option => option.value);
						console.log('values', values);
						return values;
					});

					for (const optionValue of options) {
						await page.selectOption(`[data-setting="${controlName}"]`, optionValue);

						await element.screenshot({
							type: 'jpeg',
							quality: 70
						}).toMatchSnapshot(`test-screenshots/${widgetsName}-${controlName}-${optionValue}.jpeg`);


						// Reset.
						await page.selectOption(`[data-setting="${controlName}"]`, '');
					}

					break;
			}
		}
	}
});

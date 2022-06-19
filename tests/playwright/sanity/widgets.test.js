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
				"title": {"label": "Title", "type": "textarea", "default": "Add Your Heading Text Here"},
				"link": {"label": "Link", "type": "url", "default":{"url":"","is_external":"","nofollow":"","custom_attributes":""}},
				"size": {"label": "Size", "type": "select", "default":"default"},
				"header_size": {"label": "HTML Tag", "type": "select", "default":"h2"},
				"align": {"label": "Alignment", "type": "choose", "default":""},
				"align_tablet": {"label": "Alignment", "type": "choose", "default":""},
				"align_mobile": {"label": "Alignment", "type": "choose", "default":""},
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

			console.log(controlName);

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
					await page.fill(`[data-setting="${controlName}"]`, controlConfig.default);

					break;
				case 'select':
					const options = await page.evaluate( ( args ) => {
						const options = document.querySelector(`[data-setting="${args.controlName}"]`).options;
						const values = [];
						for (let i = 0; i < options.length; i++) {
							// Skip default value.
							if ( options[i].value !== args.defaultValue ) {
								values.push(options[i].value);
							}
						}
						return values;
					}, { controlName, defaultValue: controlConfig.default } );


					console.log(controlConfig);

					for (const optionValue of options) {
						await page.selectOption(`[data-setting="${controlName}"]`, optionValue);

						// delay for rendering
						await page.waitForTimeout(800);
						await element.screenshot({
							type: 'jpeg',
							quality: 70
						}).toMatchSnapshot(`test-screenshots/${widgetsName}-${controlName}-${optionValue}.jpeg`);


						// Reset.
						await page.selectOption(`[data-setting="${controlName}"]`, '');
					}

					// Reset.
					await page.selectOption(`[data-setting="${controlName}"]`, controlConfig.default );

					break;
			}
		}
	}
});

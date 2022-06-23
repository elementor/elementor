const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test.only( 'All widgets sanity test', async ( { page }, testInfo ) => {
	const wpAdmin = new WpAdminPage( page, testInfo ),
		editor = await wpAdmin.useElementorCleanPost();

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
		'video',
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
//elementor.widgetsCache
	const widgetsConfig = {
		heading: {
			controls: {
				title: { label: 'Title', type: 'textarea', default: 'Add Your Heading Text Here' },
				link: { label: 'Link', type: 'url', default: { url: '', is_external: '', nofollow: '', custom_attributes: '' } },
				size: { label: 'Size', type: 'select', default: 'default' },
				header_size: { label: 'HTML Tag', type: 'select', default: 'h2' },
				align: { label: 'Alignment', type: 'choose', default: '' },
				//align_tablet: { label: 'Alignment', type: 'choose', default: 'center' },
				//align_mobile: { label: 'Alignment', type: 'choose', default: 'center' },
				view: { label: 'View', type: 'hidden' },
			},
		},

	};

	for ( const widgetsName in widgetsConfig ) {
		const config = widgetsConfig[ widgetsName ];

		const widgetId = await editor.addWidget( widgetsName );
		//console.log( widgetsName );

		const element = await editor.getPreviewFrame().locator( `.elementor-element-${ widgetId }` );
		await editor.page.waitForTimeout( 800 );

		expect( await element.screenshot( {
			type: 'jpeg',
			quality: 70,
		} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }.jpeg` );

		for ( const controlName in config.controls ) {
			const controlConfig = config.controls[ controlName ];

			//console.log( controlName );

			// Focus on top frame.
			await page.click( `#elementor-panel-header-title` );

			switch ( controlConfig.type ) {
				case 'textarea':
					await page.fill( `[data-setting="${ controlName }"]`, `${ widgetsName } ${ controlName } Test` );

					expect( await element.screenshot( {
						type: 'jpeg',
						quality: 70,
					} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }.jpeg` );

					// Reset.
					await page.fill( `[data-setting="${ controlName }"]`, controlConfig.default );

					break;

				case 'select':
					const options = await page.evaluate( ( args ) => {
						const domOptions = document.querySelector( `[data-setting="${ args.controlName }"]` ).options;
						const values = [];
						for ( let i = 0; i < domOptions.length; i++ ) {
							// Skip default value.
							if ( domOptions[ i ].value !== args.defaultValue ) {
								values.push( domOptions[ i ].value );
							}
						}
						return values;
					}, { controlName, defaultValue: controlConfig.default } );

					//console.log( controlConfig );

					for ( const optionValue of options ) {
						await page.selectOption( `[data-setting="${ controlName }"]`, optionValue );
						//console.log( optionValue );
						// delay for rendering
						await page.waitForTimeout( 800 );
						expect( await element.screenshot( {
							type: 'jpeg',
							quality: 70,
						} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }-${ optionValue }.jpeg` );
					}

					// Reset.
					await page.selectOption( `[data-setting="${ controlName }"]`, controlConfig.default );

					break;

					case 'choose':
						const labels = page.locator( `.elementor-control-${ controlName } .elementor-choices > label` );
						const count = await labels.count();
						for ( let i = 0; i < count; i++ ) {
								const label = await labels.nth( i );
								await label.click();
								const optionValue = await label.getAttribute( 'original-title' );
								await page.waitForTimeout( 800 );
								expect( await element.screenshot( {
									type: 'jpeg',
									quality: 70,
								} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }-${ optionValue }.jpeg` );
						}

						break;
			}
		}
	}
} );

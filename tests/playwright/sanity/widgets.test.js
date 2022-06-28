const { test, expect } = require( '@playwright/test' );
const WpAdminPage = require( '../pages/wp-admin-page.js' );

test( 'All widgets sanity test', async ( { page }, testInfo ) => {
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
			title: { label: 'Title', type: 'textarea', default: 'Add Your Heading Text Here', tab: 'content' },
			link: { label: 'Link', type: 'url', default: { url: '', is_external: '', nofollow: '', custom_attributes: '' }, tab: 'content' },
			size: { label: 'Size', type: 'select', default: 'default', tab: 'content' },
			header_size: { label: 'HTML Tag', type: 'select', default: 'h2', tab: 'content' },
			align: { label: 'Alignment', type: 'choose', default: '', tab: 'content' },
			view: { label: 'View', type: 'hidden', tab: 'content' },
			color: { type: 'color', tab: 'style', section: 'section_title_style', label: 'Text Color', global: { default: 'globals/colors?id=primary' }, name: 'title_color', default: '' },
			typography_typography: { type: 'popover_toggle', tab: 'style', section: 'section_title_style', label: 'Typography', return_value: 'custom', default: '', groupType: 'typography' },
},
		},
 divider: {
	controls: {
		align: { label: 'Alignment', type: 'choose', default: '', tab: 'content' },
		style: { type: 'select', label: 'Style', default: 'solid', tab: 'content' },
		view: { label: 'View', type: 'hidden', tab: 'content' },
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
		console.log( controlName );
		const active = await page.locator( 'div.elementor-component-tab.elementor-active ' ).getAttribute( 'data-tab' );
		if ( 'style' === controlConfig.tab && active !== 'style' ) {
		await page.locator( 'text=Style' ).click();
		}
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
					await page.waitForTimeout( 1200 );
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

				case 'color':
				await page.locator( '[aria-label="toggle color picker dialog"]' ).first().click();
				await page.locator( 'input[type="text"]' ).nth( 2 ).fill( '#FF0071' );
				expect( await element.screenshot( {
					type: 'jpeg',
					quality: 70,
				} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }.jpeg` );
				// Click .eicon-globe >> nth=0
				await page.locator( '.eicon-globe' ).first().click();
				// Click text=Accent#61CE70
				await page.locator( 'text=Accent#61CE70' ).click();
				expect( await element.screenshot( {
					type: 'jpeg',
					quality: 70,
				} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }-'global-color-accent'.jpeg` );
				break;

				case 'popover_toggle':
					switch ( controlConfig.groupType ) {
					case 'typography':
					await page.locator( 'text=Typography Edit >> i' ).nth( 2 ).click();
					// Font Famely
					await page.locator( 'span[role="textbox"]:has-text("Roboto")' ).click();
					await page.locator( '[aria-label="Google"] >> text=Aguafina Script' ).click();
					// Font Size
					await page.locator( '.elementor-control-typography_font_size input[data-setting="size"]' ).fill( '50' );
					// Weight
					await page.locator( '.elementor-control-type-select select[data-setting="typography_font_weight"]' ).selectOption( '900' );
					// Transform = Uppercase
					await page.locator( 'text=Transform Default Uppercase Lowercase Capitalize Normal >> select' ).selectOption( 'uppercase' );
					// Style = italic
					await page.locator( 'text=Style Default Normal Italic Oblique >> select' ).selectOption( 'italic' );
					// Decoration = line-through
					await page.locator( 'text=Decoration Default Underline Overline Line Through None >> select' ).selectOption( 'line-through' );
					// Line Height
					await page.locator( '.elementor-control-typography_line_height input[data-setting="size"]' ).fill( '30' );
					// Letter Spacing
					await page.locator( '.elementor-control-typography_letter_spacing input[data-setting="size"]' ).fill( '10' );
					// Word Spacing
					await page.locator( '.elementor-control-typography_word_spacing input[data-setting="size"]' ).fill( '10' );
					expect( await element.screenshot( {
						type: 'jpeg',
						quality: 70,
					} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }.jpeg` );
					//Global fonts
					// Click text=Typography Edit >> i >> nth=1
					await page.locator( 'text=Typography Edit >> i' ).nth( 1 ).click();
					// Click text=PrimarySecondaryTextAccent >> div >> nth=2
					await page.locator( 'text=PrimarySecondaryTextAccent >> div' ).nth( 2 ).click();
					expect( await element.screenshot( {
						type: 'jpeg',
						quality: 70,
					} ) ).toMatchSnapshot( `test-screenshots/${ widgetsName }-${ controlName }-'global-font-secondary'.jpeg` );
					break;
			}
				break;
		}
	}
}
} );

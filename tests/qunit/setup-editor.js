elementorCommon.ajax.send = ( action, options ) => {};

const elementorConfigDocument = {
	remoteLibrary: {
		type: 'page',
		category: '',
	},
	panel: {
		title: 'Post',
		widgets_settings: [],
		elements_categories: {
		},
		messages: {
			publish_notification: 'Hurray! Your Post is live.',
		},
	},
	container: 'body',
	urls: {
		exit_to_dashboard: 'http: //localhost/elementor/wp-admin/post.php?post=1819&action=edit',
		preview: 'http://localhost/elementor/?p=1819&elementor-preview=1819&ver=1574068998',
		wp_preview: 'http://localhost/elementor/?p=1819&preview_id=1819&preview_nonce=d50fdce90b&preview=true',
		permalink: 'http://localhost/elementor/?p=1819',
	},
	debounceDelay: 0,
};

const elementorConfigSettings = {
	page: {
		name: 'page',
		panelPage: {
			title: 'Post Settings',
		},
		controls: {
			padding: {
				unit: 'px',
				top: '',
				right: '',
				bottom: '',
				left: '',
				isLinked: true,
			},
		},
	},
	general: {
		name: 'general',
		panelPage: {
			title: 'Global Settings',
		},
		cssWrapperSelector: '',
		controls: {
			style: {
				type: 'section',
				tab: 'style',
				label: 'Style',
				name: 'style',
			},
			elementor_default_generic_fonts: {
				type: 'text',
				tab: 'style',
				section: 'style',
				label: 'Default Generic Fonts',
				default: 'Sans-serif',
				description: 'The list of fonts used if the chosen font is not available.',
				label_block: true,
				name: 'elementor_default_generic_fonts',
			},
			lightbox: {
				type: 'section',
				tab: 'lightbox',
				label: 'Lightbox',
				name: 'lightbox',
			},
			elementor_global_image_lightbox: {
				type: 'switcher',
				tab: 'lightbox',
				section: 'lightbox',
				label: 'Image Lightbox',
				default: 'yes',
				description: 'Open all image links in a lightbox popup window. The lightbox will automatically work on any link that leads to an image file.',
				frontend_available: true,
				name: 'elementor_global_image_lightbox',
			},
		},
		tabs: {
			style: 'Style',
			lightbox: 'Lightbox',
		},
		settings: {
			elementor_default_generic_fonts: 'Sans-serif ',
			elementor_container_width: '1083',
			elementor_space_between_widgets: '6',
			elementor_stretched_section_container: '0',
			elementor_page_title_selector: '5552222',
			elementor_lightbox_color: '#383838',
			elementor_lightbox_ui_color: '#ffffff',
			elementor_global_image_lightbox: 'yes',
			elementor_lightbox_ui_color_hover: '',
		},
	},
	editorPreferences: {},
};

/* global jQuery */
const ElementorConfig = {
	document: elementorConfigDocument,
	user: { introduction: {}, restrictions: [] },
	elements: {},
	dynamicTags: {},
	library_connect: {
		show_popup: 0,
	},
	icons: { libraries: [] },
	settings: elementorConfigSettings,
	schemes: {},
	controls: {
		repeater: {
			item_actions: { add: true, duplicate: true, remove: true, sort: true },
		},
	},
	autosave_interval: 1000,
};

const elementorFrontend = {
	elements: {
		window,
		$window: jQuery( window ),
	},
	config: { elements: { data: {}, editSettings: {} }, breakpoints: {} },
	isEditMode: () => {
	},
	elementsHandler: {
		runReadyTrigger: () => {
		},
	},
};

const originalGet = Marionette.TemplateCache.get;

Marionette.TemplateCache.get = function( template ) {
	if ( jQuery( template ).length ) {
		return originalGet.apply( Marionette.TemplateCache, [ template ] );
	}

	return () => `<div class="${ template }"></div>`;
};

Marionette.Region.prototype._ensureElement = () => {
	return true;
};

Marionette.Region.prototype.attachHtml = () => {
};

Marionette.CompositeView.prototype.getChildViewContainer = ( containerView ) => {
	containerView.$childViewContainer = jQuery( '<div />' );
	containerView.$childViewContainer.appendTo( '#qunit-fixture' );
	return containerView.$childViewContainer;
};

fixture.setBase( 'tests/qunit' );

QUnit.testStart( ( { module, name } ) => {
	fixture.load( 'index.html' );
} );

QUnit.testDone( ( { module, name } ) => {
	fixture.cleanup();
} );

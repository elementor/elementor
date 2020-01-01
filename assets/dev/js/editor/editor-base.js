/* global ElementorConfig, ElementorDocsConfig */
import Heartbeat from './utils/heartbeat';
import Navigator from './regions/navigator/navigator';
import HotkeysScreen from './components/hotkeys/hotkeys';
import environment from '../../../../core/common/assets/js/utils/environment.js';
import DateTimeControl from 'elementor-controls/date-time';
import NoticeBar from './utils/notice-bar';
import IconsManager from './components/icons-manager/icons-manager';
import ColorControl from './controls/color';

const App = Marionette.Application.extend( {
	documents: {},

	widgetsCache: {},

	loaded: false,

	previewLoadedOnce: false,

	helpers: require( 'elementor-editor-utils/helpers' ),
	imagesManager: require( 'elementor-editor-utils/images-manager' ),
	debug: require( 'elementor-editor-utils/debug' ),
	schemes: require( 'elementor-editor-utils/schemes' ),
	presetsFactory: require( 'elementor-editor-utils/presets-factory' ),
	templates: require( 'elementor-templates/manager' ),
	// TODO: BC Since 2.3.0
	ajax: elementorCommon.ajax,
	conditions: require( 'elementor-editor-utils/conditions' ),
	history: require( 'elementor-modules/history/assets/js/module' ),

	channels: {
		editor: Backbone.Radio.channel( 'ELEMENTOR:editor' ),
		data: Backbone.Radio.channel( 'ELEMENTOR:data' ),
		panelElements: Backbone.Radio.channel( 'ELEMENTOR:panelElements' ),
		dataEditMode: Backbone.Radio.channel( 'ELEMENTOR:editmode' ),
		deviceMode: Backbone.Radio.channel( 'ELEMENTOR:deviceMode' ),
		templates: Backbone.Radio.channel( 'ELEMENTOR:templates' ),
	},

	/**
	 * Exporting modules that can be used externally
	 * @TODO: All of the following entries should move to `elementorModules.editor`
	 */
	modules: {
		// TODO: Deprecated alias since 2.3.0
		get Module() {
			elementorCommon.helpers.hardDeprecated( 'elementor.modules.Module', '2.3.0', 'elementorModules.Module' );

			return elementorModules.Module;
		},
		components: {
			templateLibrary: {
				views: {
					// TODO: Deprecated alias since 2.4.0
					get BaseModalLayout() {
						elementorCommon.helpers.hardDeprecated( 'elementor.modules.components.templateLibrary.views.BaseModalLayout', '2.4.0', 'elementorModules.common.views.modal.Layout' );

						return elementorModules.common.views.modal.Layout;
					},
				},
			},
			saver: {
				behaviors: {
					FooterSaver: require( './components/saver/behaviors/footer-saver' ),
				},
			},
		},
		controls: {
			Animation: require( 'elementor-controls/select2' ),
			Base: require( 'elementor-controls/base' ),
			BaseData: require( 'elementor-controls/base-data' ),
			BaseMultiple: require( 'elementor-controls/base-multiple' ),
			Box_shadow: require( 'elementor-controls/box-shadow' ),
			Button: require( 'elementor-controls/button' ),
			Choose: require( 'elementor-controls/choose' ),
			Code: require( 'elementor-controls/code' ),
			Color: ColorControl,
			Date_time: DateTimeControl,
			Dimensions: require( 'elementor-controls/dimensions' ),
			Exit_animation: require( 'elementor-controls/select2' ),
			Font: require( 'elementor-controls/font' ),
			Gallery: require( 'elementor-controls/gallery' ),
			Hidden: require( 'elementor-controls/hidden' ),
			Hover_animation: require( 'elementor-controls/select2' ),
			Icon: require( 'elementor-controls/icon' ),
			Icons: require( 'elementor-controls/icons' ),
			Image_dimensions: require( 'elementor-controls/image-dimensions' ),
			Media: require( 'elementor-controls/media' ),
			Number: require( 'elementor-controls/number' ),
			Order: require( 'elementor-controls/order' ),
			Popover_toggle: require( 'elementor-controls/popover-toggle' ),
			Repeater: require( 'elementor-controls/repeater' ),
			RepeaterRow: require( 'elementor-controls/repeater-row' ),
			Section: require( 'elementor-controls/section' ),
			Select: require( 'elementor-controls/select' ),
			Select2: require( 'elementor-controls/select2' ),
			Slider: require( 'elementor-controls/slider' ),
			Structure: require( 'elementor-controls/structure' ),
			Switcher: require( 'elementor-controls/switcher' ),
			Tab: require( 'elementor-controls/tab' ),
			Text_shadow: require( 'elementor-controls/box-shadow' ),
			Url: require( 'elementor-controls/url' ),
			Wp_widget: require( 'elementor-controls/wp_widget' ),
			Wysiwyg: require( 'elementor-controls/wysiwyg' ),
		},
		elements: {
			models: {
				// TODO: Deprecated alias since 2.4.0
				get BaseSettings() {
					elementorCommon.helpers.hardDeprecated( 'elementor.modules.elements.models.BaseSettings', '2.4.0', 'elementorModules.editor.elements.models.BaseSettings' );

					return elementorModules.editor.elements.models.BaseSettings;
				},
				Element: require( 'elementor-elements/models/element' ),
			},
			views: {
				Widget: require( 'elementor-elements/views/widget' ),
			},
		},
		layouts: {
			panel: {
				pages: {
					elements: {
						views: {
							Global: require( 'elementor-panel/pages/elements/views/global' ),
							Elements: require( 'elementor-panel/pages/elements/views/elements' ),
						},
					},
					menu: {
						Menu: require( 'elementor-panel/pages/menu/menu' ),
					},
				},
			},
		},
		views: {
			// TODO: Deprecated alias since 2.4.0
			get ControlsStack() {
				elementorCommon.helpers.hardDeprecated( 'elementor.modules.views.ControlsStack', '2.4.0', 'elementorModules.editor.views.ControlsStack' );

				return elementorModules.editor.views.ControlsStack;
			},
		},
	},

	backgroundClickListeners: {
		popover: {
			element: '.elementor-controls-popover',
			ignore: '.elementor-control-popover-toggle-toggle, .elementor-control-popover-toggle-toggle-label, .select2-container',
		},
		tagsList: {
			element: '.elementor-tags-list',
			ignore: '.elementor-control-dynamic-switcher',
		},
		panelFooterSubMenus: {
			element: '.elementor-panel-footer-tool.elementor-toggle-state',
			ignore: '.elementor-panel-footer-tool.elementor-toggle-state, #elementor-panel-saver-button-publish-label',
			callback: ( $elementsToHide ) => {
				$elementsToHide.removeClass( 'elementor-open' );
			},
		},
		panelResponsiveSwitchers: {
			element: '.elementor-control-responsive-switchers',
			callback: ( $elementsToHide ) => {
				$elementsToHide.removeClass( 'elementor-responsive-switchers-open' );
			},
		},
	},

	userCan: function( capability ) {
		return -1 === this.config.user.restrictions.indexOf( capability );
	},

	_defaultDeviceMode: 'desktop',

	addControlView: function( controlID, ControlView ) {
		this.modules.controls[ elementorCommon.helpers.upperCaseWords( controlID ) ] = ControlView;
	},

	checkEnvCompatibility: function() {
		return environment.firefox || environment.webkit;
	},

	getElementData: function( model ) {
		const elType = model.get( 'elType' );

		if ( 'widget' === elType ) {
			const widgetType = model.get( 'widgetType' );

			if ( ! this.widgetsCache[ widgetType ] ) {
				return false;
			}

			if ( ! this.widgetsCache[ widgetType ].commonMerged ) {
				jQuery.extend( this.widgetsCache[ widgetType ].controls, this.widgetsCache.common.controls );

				this.widgetsCache[ widgetType ].commonMerged = true;
			}

			return this.widgetsCache[ widgetType ];
		}

		if ( ! this.config.elements[ elType ] ) {
			return false;
		}

		const elementConfig = elementorCommon.helpers.cloneObject( this.config.elements[ elType ] );

		if ( 'section' === elType && model.get( 'isInner' ) ) {
			elementConfig.title = this.translate( 'inner_section' );
		}

		return elementConfig;
	},

	getElementControls: function( modelElement ) {
		var self = this,
			elementData = self.getElementData( modelElement );

		if ( ! elementData ) {
			return false;
		}

		var isInner = modelElement.get( 'isInner' ),
			controls = {};

		_.each( elementData.controls, function( controlData, controlKey ) {
			if ( ( isInner && controlData.hide_in_inner ) || ( ! isInner && controlData.hide_in_top ) ) {
				return;
			}

			controls[ controlKey ] = controlData;
		} );

		return controls;
	},

	mergeControlsSettings: function( controls ) {
		_.each( controls, ( controlData, controlKey ) => {
			controls[ controlKey ] = jQuery.extend( true, {}, this.config.controls[ controlData.type ], controlData );
		} );

		return controls;
	},

	getControlView: function( controlID ) {
		var capitalizedControlName = elementorCommon.helpers.upperCaseWords( controlID ),
			View = this.modules.controls[ capitalizedControlName ];

		if ( ! View ) {
			var controlData = this.config.controls[ controlID ],
				isUIControl = controlData && -1 !== controlData.features.indexOf( 'ui' );

			View = this.modules.controls[ isUIControl ? 'Base' : 'BaseData' ];
		}

		return View;
	},

	getPanelView: function() {
		return this.panel.currentView;
	},

	getPreviewView: function() {
		return this.sections.currentView;
	},

	getPreviewContainer: function() {
		return this.getPreviewView().getContainer();
	},

	initComponents: function() {
		var EventManager = require( 'elementor-utils/hooks' ),
			DynamicTags = require( 'elementor-dynamic-tags/manager' ),
			Settings = require( 'elementor-editor/components/settings/settings' ),
			Saver = require( 'elementor-editor/components/saver/manager' ),
			Notifications = require( 'elementor-editor-utils/notifications' );

		this.hooks = new EventManager();

		this.saver = new Saver();

		this.settings = new Settings();

		this.dynamicTags = new DynamicTags();

		this.initDialogsManager();

		this.notifications = new Notifications();

		this.hotkeysScreen = new HotkeysScreen();

		this.iconManager = new IconsManager();

		this.noticeBar = new NoticeBar();
	},

	// TODO: BC method since 2.3.0
	initDialogsManager: function() {
		this.dialogsManager = elementorCommon.dialogsManager;
	},

	initElements: function() {
		var ElementCollection = require( 'elementor-elements/collections/elements' ),
			config = this.config.document.elements;

		// If it's an reload, use the not-saved data
		if ( this.elements && this.config.document.id === this.config.initial_document.id ) {
			config = this.elements.toJSON();
		}

		this.elements = new ElementCollection( config );

		this.elementsModel = new Backbone.Model( {
			elements: this.elements,
		} );
	},

	initPreview: function() {
		var $ = jQuery;

		this.$previewWrapper = $( '#elementor-preview' );

		this.$previewResponsiveWrapper = $( '#elementor-preview-responsive-wrapper' );

		var previewIframeId = 'elementor-preview-iframe';

		// Make sure the iFrame does not exist.
		if ( ! this.$preview ) {
			this.$preview = $( '<iframe>', {
				id: previewIframeId,
				src: this.config.initial_document.urls.preview,
				allowfullscreen: 1,
			} );

			this.$previewResponsiveWrapper.append( this.$preview );
		}

		this.$preview.on( 'load', this.onPreviewLoaded.bind( this ) );
	},

	initFrontend: function() {
		var frontendWindow = this.$preview[ 0 ].contentWindow;

		window.elementorFrontend = frontendWindow.elementorFrontend;

		frontendWindow.elementor = this;

		elementorFrontend.init();

		this.trigger( 'frontend:init' );
	},

	initClearPageDialog: function() {
		var self = this,
			dialog;

		self.getClearPageDialog = function() {
			if ( dialog ) {
				return dialog;
			}

			dialog = elementorCommon.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-clear-page-dialog',
				headerMessage: elementor.translate( 'clear_page' ),
				message: elementor.translate( 'dialog_confirm_clear_page' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: elementor.translate( 'delete' ),
					cancel: elementor.translate( 'cancel' ),
				},
				onConfirm: function() {
					$e.run( 'document/elements/empty', { force: true } );
				},
			} );

			return dialog;
		};
	},

	getCurrentElement: function() {
		const isPreview = ( -1 !== [ 'BODY', 'IFRAME' ].indexOf( document.activeElement.tagName ) && 'BODY' === elementorFrontend.elements.window.document.activeElement.tagName );

		if ( ! isPreview && ! elementorCommonConfig.isTesting ) {
			return false;
		}

		let targetElement = elementor.channels.editor.request( 'contextMenu:targetView' );

		if ( ! targetElement ) {
			const panel = elementor.getPanelView();

			if ( $e.routes.isPartOf( 'panel/editor' ) ) {
				targetElement = panel.getCurrentPageView().getOption( 'editedElementView' );
			}
		}

		if ( ! targetElement ) {
			targetElement = elementor.getPreviewView();
		}

		return targetElement;
	},

	initPanel: function() {
		this.addRegions( { panel: require( 'elementor-regions/panel/panel' ) } );

		// Set default page to elements.
		$e.route( 'panel/elements/categories' );

		this.trigger( 'panel:init' );
	},

	initNavigator: function() {
		this.addRegions( {
			navigator: {
				el: '#elementor-navigator',
				regionClass: Navigator,
			},
		} );

		this.trigger( 'navigator:init' );
	},

	setAjax: function() {
		elementorCommon.ajax.addRequestConstant( 'editor_post_id', this.config.document.id );

		elementorCommon.ajax.on( 'request:unhandledError', function( xmlHttpRequest ) {
			elementor.notifications.showToast( {
				message: elementor.createAjaxErrorMessage( xmlHttpRequest ),
			} );
		} );
	},

	createAjaxErrorMessage( xmlHttpRequest ) {
		let message;

		if ( 4 === xmlHttpRequest.readyState ) {
			message = this.translate( 'server_error' );

			if ( 200 !== xmlHttpRequest.status ) {
				message += ' (' + xmlHttpRequest.status + ' ' + xmlHttpRequest.statusText + ')';
			}
		} else if ( 0 === xmlHttpRequest.readyState ) {
			message = this.translate( 'server_connection_lost' );
		} else {
			message = this.translate( 'unknown_error' );
		}

		return message + '.';
	},

	preventClicksInsideEditor: function() {
		this.$previewContents.on( 'submit', function( event ) {
			event.preventDefault();
		} );

		this.$previewContents.on( 'click', function( event ) {
			var $target = jQuery( event.target ),
				editMode = elementor.channels.dataEditMode.request( 'activeMode' ),
				isClickInsideElementor = !! $target.closest( '.elementor-edit-area, .pen-menu' ).length,
				isTargetInsideDocument = this.contains( $target[ 0 ] );

			if ( $target.closest( 'a:not(.elementor-clickable)' ).length ) {
				event.preventDefault();
			}

			if ( ( isClickInsideElementor && 'edit' === editMode ) || ! isTargetInsideDocument ) {
				return;
			}

			if ( ! isClickInsideElementor ) {
				$e.route( 'panel/elements/categories' );
			}
		} );
	},

	addBackgroundClickArea: function( element ) {
		element.addEventListener( 'click', this.onBackgroundClick.bind( this ), true );
	},

	addBackgroundClickListener: function( key, listener ) {
		this.backgroundClickListeners[ key ] = listener;
	},

	removeBackgroundClickListener: function( key ) {
		delete this.backgroundClickListeners[ key ];
	},

	showFatalErrorDialog: function( options ) {
		var defaultOptions = {
			id: 'elementor-fatal-error-dialog',
			headerMessage: '',
			message: '',
			position: {
				my: 'center center',
				at: 'center center',
			},
			strings: {
				confirm: this.translate( 'learn_more' ),
				cancel: this.translate( 'go_back' ),
			},
			onConfirm: null,
			onCancel: function() {
				parent.history.go( -1 );
			},
			hide: {
				onBackgroundClick: false,
				onButtonClick: false,
			},
		};

		options = jQuery.extend( true, defaultOptions, options );

		elementorCommon.dialogsManager.createWidget( 'confirm', options ).show();
	},

	showFlexBoxAttentionDialog: function() {
		const introduction = new elementorModules.editor.utils.Introduction( {
			introductionKey: 'flexbox',
			dialogType: 'confirm',
			dialogOptions: {
				id: 'elementor-flexbox-attention-dialog',
				headerMessage: this.translate( 'flexbox_attention_header' ),
				message: this.translate( 'flexbox_attention_message' ),
				position: {
					my: 'center center',
					at: 'center center',
				},
				strings: {
					confirm: this.translate( 'learn_more' ),
					cancel: this.translate( 'got_it' ),
				},
				hide: {
					onButtonClick: false,
				},
				onCancel: () => {
					introduction.setViewed();

					introduction.getDialog().hide();
				},
				onConfirm: () => open( this.config.help_flexbox_bc_url, '_blank' ),
			},
		} );

		introduction.show();
	},

	checkPageStatus: function() {
		if ( elementor.config.document.revisions.current_id !== elementor.config.document.id ) {
			this.notifications.showToast( {
				message: this.translate( 'working_on_draft_notification' ),
				buttons: [
					{
						name: 'view_revisions',
						text: elementor.translate( 'view_all_revisions' ),
						callback: function() {
							$e.route( 'panel/history/revisions' );
						},
					},
				],
			} );
		}
	},

	openLibraryOnStart: function() {
		if ( '#library' === location.hash ) {
			$e.run( 'library/open' );

			location.hash = '';
		}
	},

	enterPreviewMode: function( hidePanel ) {
		var $elements = elementorFrontend.elements.$body;

		if ( hidePanel ) {
			$elements = $elements.add( elementorCommon.elements.$body );
		}

		$elements
		.removeClass( 'elementor-editor-active' )
		.addClass( 'elementor-editor-preview' );

		this.$previewElementorEl
		.removeClass( 'elementor-edit-area-active' )
		.addClass( 'elementor-edit-area-preview' );

		if ( hidePanel ) {
			// Handle panel resize
			this.$previewWrapper.css( elementorCommon.config.isRTL ? 'right' : 'left', '' );

			this.panel.$el.css( 'width', '' );
		}
	},

	exitPreviewMode: function() {
		elementorFrontend.elements.$body.add( elementorCommon.elements.$body )
		.removeClass( 'elementor-editor-preview' )
		.addClass( 'elementor-editor-active' );

		this.$previewElementorEl
		.removeClass( 'elementor-edit-area-preview' )
		.addClass( 'elementor-edit-area-active' );
	},

	changeEditMode: function( newMode ) {
		var dataEditMode = elementor.channels.dataEditMode,
			oldEditMode = dataEditMode.request( 'activeMode' );

		dataEditMode.reply( 'activeMode', newMode );

		if ( newMode !== oldEditMode ) {
			dataEditMode.trigger( 'switch', newMode );
		}
	},

	reloadPreview: function() {
		jQuery( '#elementor-preview-loading' ).show();

		this.$preview[ 0 ].contentWindow.location.reload( true );
	},

	changeDeviceMode: function( newDeviceMode ) {
		var oldDeviceMode = this.channels.deviceMode.request( 'currentMode' );

		if ( oldDeviceMode === newDeviceMode ) {
			return;
		}

		elementorCommon.elements.$body
		.removeClass( 'elementor-device-' + oldDeviceMode )
		.addClass( 'elementor-device-' + newDeviceMode );

		this.channels.deviceMode
		.reply( 'previousMode', oldDeviceMode )
		.reply( 'currentMode', newDeviceMode )
		.trigger( 'change' );
	},

	enqueueTypographyFonts: function() {
		var self = this,
			typographyScheme = this.schemes.getScheme( 'typography' );

		self.helpers.resetEnqueuedFontsCache();

		_.each( typographyScheme.items, function( item ) {
			self.helpers.enqueueFont( item.value.font_family );
		} );
	},

	translate: function( stringKey, templateArgs, i18nStack ) {
		// TODO: BC since 2.3.0, it always should be `this.config.i18n`
		if ( ! i18nStack ) {
			i18nStack = this.config.i18n;
		}

		return elementorCommon.translate( stringKey, null, templateArgs, i18nStack );
	},

	logSite: function() {
		var text = '',
			style = '';

		if ( environment.firefox ) {
			var asciiText = [
				' ;;;;;;;;;;;;;;; ',
				';;;  ;;       ;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;       ;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;       ;;;',
				' ;;;;;;;;;;;;;;; ',
			];

			text += '%c' + asciiText.join( '\n' ) + '\n';

			style = 'color: #C42961';
		} else {
			text += '%c00';

			style = 'font-size: 22px; background-image: url("' + elementorCommon.config.urls.assets + 'images/logo-icon.png"); color: transparent; background-repeat: no-repeat';
		}

		setTimeout( console.log.bind( console, text, style ) ); // eslint-disable-line

		text = '%cLove using Elementor? Join our growing community of Elementor developers: %chttps://github.com/elementor/elementor';

		setTimeout( console.log.bind( console, text, 'color: #9B0A46', '' ) ); // eslint-disable-line
	},

	requestWidgetsConfig: function() {
		const excludeWidgets = {};

		jQuery.each( this.widgetsCache, ( widgetName, widgetConfig ) => {
			if ( widgetConfig.controls ) {
				excludeWidgets[ widgetName ] = true;
			}
		} );

		elementorCommon.ajax.addRequest( 'get_widgets_config', {
			data: {
				exclude: excludeWidgets,
			},
			success: ( data ) => {
				jQuery.each( data, ( widgetName, controlsConfig ) => {
					this.widgetsCache[ widgetName ] = jQuery.extend( {}, this.widgetsCache[ widgetName ], controlsConfig );
				} );

				if ( this.loaded ) {
					this.schemes.printSchemesStyle();
				}

				elementorCommon.elements.$body.addClass( 'elementor-controls-ready' );
			},
		} );
	},

	getPreferences: function( key ) {
		const settings = elementor.settings.editorPreferences.model.attributes;

		if ( key ) {
			return settings[ key ];
		}

		return settings;
	},

	onStart: function() {
		this.config = ElementorConfig;

		Backbone.Radio.DEBUG = false;
		Backbone.Radio.tuneIn( 'ELEMENTOR' );

		this.initComponents();

		if ( ! this.checkEnvCompatibility() ) {
			this.onEnvNotCompatible();
		}

		this.initPreview();

		this.requestWidgetsConfig();

		this.channels.dataEditMode.reply( 'activeMode', 'edit' );

		this.listenTo( this.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		this.initClearPageDialog();

		this.addBackgroundClickArea( document );

		this.addDeprecatedConfigProperties();

		this.initDocument();

		this.logSite();
	},

	initDocument( id ) {
		id = id || this.config.initial_document.id;

		this.requestDocument( id ).then( () => {
			this.setAjax();

			jQuery.each( this.config.document.widgets, ( widgetName, widgetConfig ) => {
				this.widgetsCache[ widgetName ] = jQuery.extend( {}, this.widgetsCache[ widgetName ], widgetConfig );
			} );

			this.templates.init();

			elementorCommon.elements.$window.trigger( 'elementor:init' );

			this.on( 'preview:loaded', () => {
				this.$previewContents.find( '.elementor-edit-button' ).remove();
				this.$previewContents.find( '.elementor-inner' ).not( '.elementor-edit-area > .elementor-inner' ).prepend( '<span class="elementor-edit-button">' +
					'<i class="eicon-edit"></i>' +
					'</span>' );

				this.$previewContents.find( '.elementor-edit-button' ).on( 'click', ( event ) => {
					this.enterPreviewMode();

					jQuery( event.target ).addClass( 'loading' );

					jQuery( event.target ).parents( '.elementor-inner' ).addClass( 'loading' );

					const docId = jQuery( event.target ).parents( '[data-elementor-id]' ).data( 'elementor-id' );
					this.initDocument( docId );
				} );
			} );

			if ( this.loaded ) {
				this.$preview.trigger( 'load' );
				this.$previewContents.find( `#elementor-post-${ id }-css` ).remove();

				const previewRevisionID = elementor.config.document.revisions.current_id;

				this.$previewContents.find( `#elementor-preview-${ previewRevisionID }` ).remove();

				elementor.helpers.scrollToView( this.$previewElementorEl );

				this.$previewElementorEl.addClass( 'elementor-embedded-editor' );
			}
		} );
	},

	onPreviewLoaded: function() {
		NProgress.done();

		var previewWindow = this.$preview[ 0 ].contentWindow;

		if ( ! previewWindow.elementorFrontend ) {
			this.onPreviewLoadingError();

			return;
		}

		this.$previewContents = this.$preview.contents();
		this.$previewElementorEl = this.$previewContents.find( '.elementor-' + this.config.document.id );

		if ( ! this.$previewElementorEl.length ) {
			this.onPreviewElNotFound();

			return;
		}

		this.$previewElementorEl.addClass( 'elementor-edit-area' );

		this.initFrontend();

		this.initElements();

		var iframeRegion = new Marionette.Region( {
			// Make sure you get the DOM object out of the jQuery object
			el: this.$previewElementorEl[ 0 ],
		} );

		this.schemes.init();
		this.schemes.printSchemesStyle();

		this.preventClicksInsideEditor();

		this.addBackgroundClickArea( elementorFrontend.elements.window.document );

		if ( this.previewLoadedOnce ) {
			$e.route( 'panel/elements/categories' );
		} else {
			this.onFirstPreviewLoaded();
		}

		this.addRegions( {
			sections: iframeRegion,
		} );

		var Preview = require( 'elementor-views/preview' );

		this.sections.show( new Preview( { model: this.elementsModel } ) );

		this.$previewContents.children().addClass( 'elementor-html' );

		const $frontendBody = elementorFrontend.elements.$body;

		$frontendBody.addClass( 'elementor-editor-active' );

		if ( ! elementor.userCan( 'design' ) ) {
			$frontendBody.addClass( 'elementor-editor-content-only' );
		}

		this.changeDeviceMode( this._defaultDeviceMode );

		jQuery( '#elementor-loading, #elementor-preview-loading' ).fadeOut( 600 );

		_.defer( function() {
			elementorFrontend.elements.window.jQuery.holdReady( false );
		} );

		this.enqueueTypographyFonts();

		this.onEditModeSwitched();

		$e.shortcuts.bindListener( elementorFrontend.elements.$window );

		this.trigger( 'preview:loaded', ! this.loaded /* isFirst */ );

		this.loaded = true;
	},

	onFirstPreviewLoaded: function() {
		this.initPanel();

		this.heartbeat = new Heartbeat();

		this.checkPageStatus();

		this.openLibraryOnStart();

		const isOldPageVersion = this.config.document.version && this.helpers.compareVersions( this.config.document.version, '2.5.0', '<' );

		if ( ! this.config.user.introduction.flexbox && isOldPageVersion ) {
			this.showFlexBoxAttentionDialog();
		}

		this.initNavigator();

		this.previewLoadedOnce = true;
	},

	onEditModeSwitched: function() {
		var activeMode = this.channels.dataEditMode.request( 'activeMode' );

		if ( 'edit' === activeMode ) {
			this.exitPreviewMode();
		} else {
			this.enterPreviewMode( 'preview' === activeMode );
		}
	},

	onEnvNotCompatible: function() {
		this.showFatalErrorDialog( {
			headerMessage: this.translate( 'device_incompatible_header' ),
			message: this.translate( 'device_incompatible_message' ),
			strings: {
				confirm: elementor.translate( 'proceed_anyway' ),
			},
			hide: {
				onButtonClick: true,
			},
			onConfirm: function() {
				this.hide();
			},
		} );
	},

	onPreviewLoadingError: function() {
		const self = this;

		const debugUrl = self.config.document.urls.preview + '&preview-debug',
			previewDebugLinkText = self.config.i18n.preview_debug_link_text,
			previewDebugLink = '<div id="elementor-preview-debug-link-text"><a href="' + debugUrl + '" target="_blank">' + previewDebugLinkText + '</a></div>',
			debugData = elementor.config.preview.debug_data,
			dialogOptions = {
				className: 'elementor-preview-loading-error',
				headerMessage: debugData.header,
				message: debugData.message + previewDebugLink,
				onConfirm: function() {
					open( debugData.doc_url, '_blank' );
				} };

		if ( debugData.error ) {
			self.showFatalErrorDialog( dialogOptions );
			return;
		}

		jQuery.get( debugUrl, function() {
			self.showFatalErrorDialog( dialogOptions );
		} ).fail( function( response ) { //Iframe can't be loaded
			self.showFatalErrorDialog( {
				className: 'elementor-preview-loading-error',
				headerMessage: debugData.header,
				message: response.statusText + ' ' + response.status + ' ' + previewDebugLink,
				onConfirm: function() {
					const url = 500 <= response.status ? elementor.config.preview.help_preview_http_error_500_url : elementor.config.preview.help_preview_http_error_url;
					open( url, '_blank' );
				},
			} );
		} );
	},

	onPreviewElNotFound: function() {
		var args = this.$preview[ 0 ].contentWindow.elementorPreviewErrorArgs;

		if ( ! args ) {
			args = {
				headerMessage: this.translate( 'preview_el_not_found_header' ),
				message: this.translate( 'preview_el_not_found_message' ),
				confirmURL: elementor.config.help_the_content_url,
			};
		}

		args.onConfirm = function() {
			open( args.confirmURL, '_blank' );
		};

		this.showFatalErrorDialog( args );
	},

	onBackgroundClick: function( event ) {
		jQuery.each( this.backgroundClickListeners, function() {
			let $clickedTarget = jQuery( event.target );

			// If it's a label that associated with an input
			if ( $clickedTarget[ 0 ].control ) {
				$clickedTarget = $clickedTarget.add( $clickedTarget[ 0 ].control );
			}

			if ( this.ignore && $clickedTarget.closest( this.ignore ).length ) {
				return;
			}

			const $clickedTargetClosestElement = $clickedTarget.closest( this.element ),
				$elementsToHide = jQuery( this.element ).not( $clickedTargetClosestElement );

			if ( this.callback ) {
				this.callback( $elementsToHide );

				return;
			}

			$elementsToHide.hide();
		} );
	},

	compileTemplate: function( template, data ) {
		return Marionette.TemplateCache.prototype.compileTemplate( template )( data );
	},

	requestDocument( id ) {
		return elementorCommon.ajax.addRequest( 'get_document_config', {
			data: { id },
			success: ( config ) => {
				this.documents[ id ] = config;
				this.config.document = this.documents[ id ];

				this.settings.page = new this.settings.modules.page( this.documents[ id ].settings );

				if ( this.loaded ) {
					this.schemes.printSchemesStyle();
				}

				elementorCommon.elements.$body.addClass( `elementor-editor-${ this.config.document.type }` );
			},
			error: ( data ) => {
				let message;

				if ( _.isString( data ) ) {
					message = data;
				} else if ( data.statusText ) {
					message = elementor.createAjaxErrorMessage( data );

					if ( 0 === data.readyState ) {
						message += ' ' + elementor.translate( 'Cannot load editor' );
					}
				} else if ( data[ 0 ] && data[ 0 ].code ) {
					message = elementor.translate( 'server_error' ) + ' ' + data[ 0 ].code;
				}

				alert( message );
			},
		}, true );
	},

	addDeprecatedConfigProperties() {
		const map = {
			data: {
				replacement: 'elements',
				value: () => elementor.config.document.elements,
			},

			widgets: {
				replacement: 'widgets',
				value: () => elementor.widgetsCache,
			},
			current_user_can_publish: {
				replacement: 'user.can_publish',
				value: () => elementor.config.document.user.can_publish,
			},
			locked_user: {
				replacement: 'user.locked',
				value: () => elementor.config.document.user.locked,
			},
			revisions_enabled: {
				replacement: 'revisions.enabled',
				value: () => elementor.config.document.revisions.enabled,
			},
			current_revision_id: {
				replacement: 'revisions.current_id',
				value: () => elementor.config.document.revisions.current_id,
			},
		};

		// replacement `defineProperty` because `get property()` fails during the `Marionette...extend`.

		jQuery.each( map, ( key, data ) => {
			// elementor.config[ key ] = data.value;
			Object.defineProperty( this.config, key, {
				get() {
					elementorCommon.helpers.softDeprecated( 'elementor.config.' + key, '2.9.0', 'elementor.config.document.' + data.replacement );
					// return from current document.
					return data.value();
				},
			} );
		} );

		Object.defineProperty( this.config.settings, 'page', {
			get() {
				elementorCommon.helpers.softDeprecated( 'elementor.config.settings.page', '2.9.0', 'elementor.config.document.settings' );
				return elementor.config.document.settings;
			},
		} );
	},
} );

module.exports = App;

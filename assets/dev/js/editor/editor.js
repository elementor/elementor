/* global ElementorConfig */
import Heartbeat from './utils/heartbeat';
import Navigator from './regions/navigator/navigator';
import HotkeysScreen from './components/hotkeys/hotkeys';
import environment from '../../../../core/common/assets/js/utils/environment.js';
import DateTimeControl from 'elementor-controls/date-time';

const App = Marionette.Application.extend( {
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
			elementorCommon.helpers.deprecatedMethod( 'elementor.modules.Module', '2.3.0', 'elementorModules.Module' );

			return elementorModules.Module;
		},
		components: {
			templateLibrary: {
				views: {
					// TODO: Deprecated alias since 2.4.0
					get BaseModalLayout() {
						elementorCommon.helpers.deprecatedMethod( 'elementor.modules.components.templateLibrary.views.BaseModalLayout', '2.4.0', 'elementorModules.common.views.modal.Layout' );

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
			Color: require( 'elementor-controls/color' ),
			Date_time: DateTimeControl,
			Dimensions: require( 'elementor-controls/dimensions' ),
			Font: require( 'elementor-controls/font' ),
			Gallery: require( 'elementor-controls/gallery' ),
			Hover_animation: require( 'elementor-controls/select2' ),
			Icon: require( 'elementor-controls/icon' ),
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
					elementorCommon.helpers.deprecatedMethod( 'elementor.modules.elements.models.BaseSettings', '2.4.0', 'elementorModules.editor.elements.models.BaseSettings' );

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
				elementorCommon.helpers.deprecatedMethod( 'elementor.modules.views.ControlsStack', '2.4.0', 'elementorModules.editor.views.ControlsStack' );

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
			element: '.elementor-panel-footer-tool',
			ignore: '.elementor-panel-footer-tool.elementor-toggle-state, #elementor-panel-saver-button-publish-label',
			callback: ( $elementsToHide ) => {
				$elementsToHide.removeClass( 'elementor-open' );
			},
		},
	},

	userCan: function( capability ) {
		return -1 === this.config.user.restrictions.indexOf( capability );
	},

	_defaultDeviceMode: 'desktop',

	addControlView: function( controlID, ControlView ) {
		this.modules.controls[ elementorCommon.helpers.firstLetterUppercase( controlID ) ] = ControlView;
	},

	checkEnvCompatibility: function() {
		return environment.firefox || environment.webkit;
	},

	getElementData: function( model ) {
		const elType = model.get( 'elType' );

		if ( 'widget' === elType ) {
			const widgetType = model.get( 'widgetType' );

			if ( ! this.config.widgets[ widgetType ] ) {
				return false;
			}

			if ( ! this.config.widgets[ widgetType ].commonMerged ) {
				jQuery.extend( this.config.widgets[ widgetType ].controls, this.config.widgets.common.controls );

				this.config.widgets[ widgetType ].commonMerged = true;
			}

			return this.config.widgets[ widgetType ];
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
		var capitalizedControlName = elementorCommon.helpers.firstLetterUppercase( controlID ),
			View = this.modules.controls[ capitalizedControlName ];

		if ( ! View ) {
			var controlData = this.config.controls[ controlID ],
				isUIControl = -1 !== controlData.features.indexOf( 'ui' );

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

		this.templates.init();

		this.initDialogsManager();

		this.notifications = new Notifications();

		this.registerCommands();

		this.hotkeysScreen = new HotkeysScreen();
	},

	// TODO: BC method since 2.3.0
	initDialogsManager: function() {
		this.dialogsManager = elementorCommon.dialogsManager;
	},

	initElements: function() {
		var ElementCollection = require( 'elementor-elements/collections/elements' ),
			config = this.config.data;

		// If it's an reload, use the not-saved data
		if ( this.elements ) {
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
				src: this.config.document.urls.preview,
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
					self.elements.reset();
				},
			} );

			return dialog;
		};
	},

	getCurrentElement: function() {
		const isPreview = ( -1 !== [ 'BODY', 'IFRAME' ].indexOf( document.activeElement.tagName ) && 'BODY' === elementorFrontend.elements.window.document.activeElement.tagName );

		if ( ! isPreview ) {
			return false;
		}

		let targetElement = elementor.channels.editor.request( 'contextMenu:targetView' );

		if ( ! targetElement ) {
			const panel = elementor.getPanelView();

			if ( elementorCommon.route.isPartOf( 'panel/editor' ) ) {
				targetElement = panel.getCurrentPageView().getOption( 'editedElementView' );
			}
		}

		if ( ! targetElement ) {
			targetElement = elementor.getPreviewView();
		}

		return targetElement;
	},

	registerCommands: function() {
		elementorCommon.commands.registerComponent( 'elements', {
			before: () => {
				return elementor.getCurrentElement();
			},
		} );

		elementorCommon.commands.register( 'elements/copy', () => elementor.getCurrentElement().copy(), {
			keys: 'ctrl+c',
			exclude: [ 'input' ],
		} );

		elementorCommon.commands.register( 'elements/duplicate', () => elementor.getCurrentElement().duplicate(), {
			keys: 'ctrl+d',
		} );

		elementorCommon.commands.register( 'elements/delete', () => elementor.getCurrentElement().removeElement(), {
			keys: 'del',
			exclude: [ 'input' ],
		} );

		elementorCommon.commands.register( 'elements/paste', () => elementor.getCurrentElement().paste(), {
			keys: 'ctrl+v',
			exclude: [ 'input' ],
			dependency: () => {
				return elementor.getCurrentElement().isPasteEnabled();
			},
		} );

		elementorCommon.commands.register( 'elements/pasteStyle', () => elementor.getCurrentElement().paste(), {
			keys: 'ctrl+shift+v',
			exclude: [ 'input' ],
			dependency: () => {
				return elementor.getCurrentElement().pasteStyle && elementorCommon.storage.get( 'transfer' );
			},
		} );

		elementorCommon.commands.registerComponent( 'navigator', {
			before: () => 'edit' === elementor.channels.dataEditMode.request( 'activeMode' ),
		} );

		elementorCommon.commands.register( 'navigator/toggle', () => {
			if ( elementor.navigator.storage.visible ) {
				elementor.navigator.close();
			} else {
				elementor.navigator.open();
			}
		}, { keys: 'ctrl+i' } );

		elementorCommon.commands.registerComponent( 'preview' );

		elementorCommon.commands.register( 'preview/change-device-mode', () => {
			const currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' );
			let modeIndex = this.devices.indexOf( currentDeviceMode );

			modeIndex++;

			if ( modeIndex >= this.devices.length ) {
				modeIndex = 0;
			}
			//
			elementor.changeDeviceMode( this.devices[ modeIndex ] );
		}, { keys: 'ctrl+shift+m' } );
	},

	initPanel: function() {
		this.addRegions( { panel: require( 'elementor-regions/panel/panel' ) } );

		this.trigger( 'panel:init' );
	},

	initNavigator: function() {
		this.addRegions( {
			navigator: {
				el: '#elementor-navigator',
				regionClass: Navigator,
			},
		} );
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
				isClickInsideElementor = !! $target.closest( '#elementor, .pen-menu' ).length,
				isTargetInsideDocument = this.contains( $target[ 0 ] );

			if ( ( isClickInsideElementor && 'edit' === editMode ) || ! isTargetInsideDocument ) {
				return;
			}

			if ( $target.closest( 'a:not(.elementor-clickable)' ).length ) {
				event.preventDefault();
			}

			if ( ! isClickInsideElementor ) {
				elementorCommon.route.to( 'panel/elements/categories' );
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
		if ( elementor.config.current_revision_id !== elementor.config.document.id ) {
			this.notifications.showToast( {
				message: this.translate( 'working_on_draft_notification' ),
				buttons: [
					{
						name: 'view_revisions',
						text: elementor.translate( 'view_all_revisions' ),
						callback: function() {
							elementorCommon.route.to( 'panel/history/revisions' );
						},
					},
				],
			} );
		}
	},

	openLibraryOnStart: function() {
		if ( '#library' === location.hash ) {
			elementorCommon.commands.run( 'library/show' );

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

	clearPage: function() {
		this.getClearPageDialog().show();
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

		jQuery.each( this.config.widgets, ( widgetName, widgetConfig ) => {
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
					const widgetConfig = this.config.widgets[ widgetName ];

					widgetConfig.controls = controlsConfig.controls;
					widgetConfig.tabs_controls = controlsConfig.tabs_controls;
				} );

				if ( this.loaded ) {
					this.schemes.printSchemesStyle();
				}

				elementorCommon.elements.$body.addClass( 'elementor-controls-ready' );
			},
		} );
	},

	onStart: function() {
		NProgress.start();
		NProgress.inc( 0.2 );

		this.config = ElementorConfig;

		Backbone.Radio.DEBUG = false;
		Backbone.Radio.tuneIn( 'ELEMENTOR' );

		this.initComponents();

		if ( ! this.checkEnvCompatibility() ) {
			this.onEnvNotCompatible();
		}

		this.setAjax();

		this.requestWidgetsConfig();

		this.channels.dataEditMode.reply( 'activeMode', 'edit' );

		this.listenTo( this.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		this.initClearPageDialog();

		this.addBackgroundClickArea( document );

		elementorCommon.elements.$window.trigger( 'elementor:init' );

		this.initPreview();

		this.logSite();
	},

	onPreviewLoaded: function() {
		NProgress.done();

		var previewWindow = this.$preview[ 0 ].contentWindow;

		if ( ! previewWindow.elementorFrontend ) {
			this.onPreviewLoadingError();

			return;
		}

		this.$previewContents = this.$preview.contents();
		this.$previewElementorEl = this.$previewContents.find( '#elementor' );

		if ( ! this.$previewElementorEl.length ) {
			this.onPreviewElNotFound();

			return;
		}

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
			elementorCommon.route.to( 'panel/elements/categories' );
		} else {
			this.onFirstPreviewLoaded();
		}

		this.initNavigator();

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

		elementorCommon.shortcuts.bindListener( elementorFrontend.elements.$window );

		this.trigger( 'preview:loaded' );

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
		this.showFatalErrorDialog( {
			headerMessage: this.translate( 'preview_not_loading_header' ),
			message: this.translate( 'preview_not_loading_message' ) + '<br><a href="' + this.config.document.urls.preview + '" target="_blank">Preview Debug</a>',
			onConfirm: function() {
				open( elementor.config.help_preview_error_url, '_blank' );
			},
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
} );

window.elementor = new App();

if ( -1 === location.href.search( 'ELEMENTOR_TESTS=1' ) ) {
	elementor.start();
}

module.exports = elementor;

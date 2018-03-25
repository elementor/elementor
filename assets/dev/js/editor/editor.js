/* global ElementorConfig */
var App;

Marionette.TemplateCache.prototype.compileTemplate = function( rawTemplate, options ) {
	options = {
		evaluate: /<#([\s\S]+?)#>/g,
		interpolate: /{{{([\s\S]+?)}}}/g,
		escape: /{{([^}]+?)}}(?!})/g
	};

	return _.template( rawTemplate, options );
};

App = Marionette.Application.extend( {
	helpers: require( 'elementor-editor-utils/helpers' ),
	heartbeat: require( 'elementor-editor-utils/heartbeat' ),
	imagesManager: require( 'elementor-editor-utils/images-manager' ),
	debug: require( 'elementor-editor-utils/debug' ),
	schemes: require( 'elementor-editor-utils/schemes' ),
	presetsFactory: require( 'elementor-editor-utils/presets-factory' ),
	templates: require( 'elementor-templates/manager' ),
	ajax: require( 'elementor-editor-utils/ajax' ),
	conditions: require( 'elementor-editor-utils/conditions' ),
	hotKeys: require( 'elementor-utils/hot-keys' ),
	history:  require( 'modules/history/assets/js/module' ),

	channels: {
		editor: Backbone.Radio.channel( 'ELEMENTOR:editor' ),
		data: Backbone.Radio.channel( 'ELEMENTOR:data' ),
		panelElements: Backbone.Radio.channel( 'ELEMENTOR:panelElements' ),
		dataEditMode: Backbone.Radio.channel( 'ELEMENTOR:editmode' ),
		deviceMode: Backbone.Radio.channel( 'ELEMENTOR:deviceMode' ),
		templates: Backbone.Radio.channel( 'ELEMENTOR:templates' )
	},

	// Exporting modules that can be used externally
	modules: {
		Module: require( 'elementor-utils/module' ),
		components: {
			templateLibrary: {
				views: {
					parts: {
						headerParts: {
							logo: require( 'elementor-templates/views/parts/header-parts/logo' )
						}
					},
					BaseModalLayout: require( 'elementor-templates/views/base-modal-layout' )
				}
			},
			saver: {
				behaviors: {
					FooterSaver: require( './components/saver/behaviors/footer-saver' )
				}
			}
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
			Date_time: require( 'elementor-controls/date-time' ),
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
			Select2: require( 'elementor-controls/select2' ),
			Slider: require( 'elementor-controls/slider' ),
			Structure: require( 'elementor-controls/structure' ),
			Switcher: require( 'elementor-controls/switcher' ),
			Tab: require( 'elementor-controls/tab' ),
			Text_shadow: require( 'elementor-controls/box-shadow' ),
			Url: require( 'elementor-controls/base-multiple' ),
			Wp_widget: require( 'elementor-controls/wp_widget' ),
			Wysiwyg: require( 'elementor-controls/wysiwyg' )
		},
		elements: {
			models: {
				BaseSettings: require( 'elementor-elements/models/base-settings' ),
				Element: require( 'elementor-elements/models/element' )
			},
			views: {
				Widget: require( 'elementor-elements/views/widget' )
			}
		},
		layouts: {
			panel: {
				pages: {
					elements: {
						views: {
							Global: require( 'elementor-panel/pages/elements/views/global' ),
							Elements: require( 'elementor-panel/pages/elements/views/elements' )
						}
					},
					menu: {
						Menu: require( 'elementor-panel/pages/menu/menu' )
					}
				}
			}
		},
		views: {
			ControlsStack: require( 'elementor-views/controls-stack' )
		}
	},

	backgroundClickListeners: {
		popover: {
			element: '.elementor-controls-popover',
			ignore: '.elementor-control-popover-toggle-toggle, .elementor-control-popover-toggle-toggle-label'
		},
		tagsList: {
			element: '.elementor-tags-list',
			ignore: '.elementor-control-dynamic-switcher'
		}
	},

	userCan: function( capability ) {
		return -1 === this.config.user.restrictions.indexOf( capability );
	},

	_defaultDeviceMode: 'desktop',

	addControlView: function( controlID, ControlView ) {
		this.modules.controls[ controlID[0].toUpperCase() + controlID.slice( 1 ) ] = ControlView;
	},

	checkEnvCompatibility: function() {
		return this.envData.gecko || this.envData.webkit;
	},

	getElementData: function( modelElement ) {
		var elType = modelElement.get( 'elType' );

		if ( 'widget' === elType ) {
			var widgetType = modelElement.get( 'widgetType' );

			if ( ! this.config.widgets[ widgetType ] ) {
				return false;
			}

			return this.config.widgets[ widgetType ];
		}

		if ( ! this.config.elements[ elType ] ) {
			return false;
		}

		return this.config.elements[ elType ];
	},

	getElementControls: function( modelElement ) {
		var self = this,
			elementData = self.getElementData( modelElement );

		if ( ! elementData ) {
			return false;
		}

		var isInner = modelElement.get( 'isInner' ),
			controls = {},
			userCanEditStyle = elementor.userCan( 'design' );

		_.each( elementData.controls, function( controlData, controlKey ) {
			if ( isInner && controlData.hide_in_inner || ! isInner && controlData.hide_in_top ) {
				return;
			}

			if ( ! userCanEditStyle && 'content' !== controlData.tab ) {
				return;
			}

			controls[ controlKey ] = controlData;
		} );

		return controls;
	},

	mergeControlsSettings: function( controls ) {
		var  self = this;

		_.each( controls, function( controlData, controlKey ) {
			controls[ controlKey ] = jQuery.extend( true, {}, self.config.controls[ controlData.type ], controlData  );
		} );

		return controls;
	},

	getControlView: function( controlID ) {
		var capitalizedControlName = controlID[0].toUpperCase() + controlID.slice( 1 ),
			View = this.modules.controls[ capitalizedControlName ];

		if ( ! View ) {
			var controlData = this.config.controls[ controlID ],
				isUIControl = -1 !== controlData.features.indexOf( 'ui' );

			View = this.modules.controls[ isUIControl ? 'Base' : 'BaseData' ];
		}

		return View;
	},

	getPanelView: function() {
		return this.getRegion( 'panel' ).currentView;
	},

	initEnvData: function() {
		this.envData = _.pick( tinymce.EditorManager.Env, [ 'desktop', 'webkit', 'gecko', 'ie', 'opera' ] );
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

		/**
		 * @deprecated 1.6.0 - use `this.settings.page` instead
		 */
		this.pageSettings = this.settings.page;

		this.templates.init();

		this.initDialogsManager();

		this.notifications = new Notifications();

		this.ajax.init();
	},

	initDialogsManager: function() {
		this.dialogsManager = new DialogsManager.Instance();
	},

	initElements: function() {
		var ElementCollection = require( 'elementor-elements/collections/elements' ),
			config = this.config.data;

		// If it's an reload, use the not-saved data
		if ( this.elements ) {
			config = this.elements.toJSON();
		}

		this.elements = new ElementCollection( config );
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
				allowfullscreen: 1
			} );

			this.$previewResponsiveWrapper.append( this.$preview );
		}

		this.$preview
			.on( 'load', this.onPreviewLoaded.bind( this ) )
			.one( 'load', this.checkPageStatus.bind( this ) );
	},

	initFrontend: function() {
		var frontendWindow = this.$preview[0].contentWindow;

		window.elementorFrontend = frontendWindow.elementorFrontend;

		frontendWindow.elementor = this;

		elementorFrontend.init();

		elementorFrontend.elementsHandler.initHandlers();

		this.trigger( 'frontend:init' );
	},

	initClearPageDialog: function() {
		var self = this,
			dialog;

		self.getClearPageDialog = function() {
			if ( dialog ) {
				return dialog;
			}

			dialog = this.dialogsManager.createWidget( 'confirm', {
				id: 'elementor-clear-page-dialog',
				headerMessage: elementor.translate( 'clear_page' ),
				message: elementor.translate( 'dialog_confirm_clear_page' ),
				position: {
					my: 'center center',
					at: 'center center'
				},
				strings: {
					confirm: elementor.translate( 'delete' ),
					cancel: elementor.translate( 'cancel' )
				},
				onConfirm: function() {
					self.getRegion( 'sections' ).currentView.collection.reset();
				}
			} );

			return dialog;
		};
	},

	initHotKeys: function() {
		var keysDictionary = {
			del: 46,
			d: 68,
			l: 76,
			m: 77,
			p: 80,
			s: 83
		};

		var $ = jQuery,
			hotKeysHandlers = {},
			hotKeysManager = this.hotKeys;

		hotKeysHandlers[ keysDictionary.del ] = {
			deleteElement: {
				isWorthHandling: function( event ) {
					var isEditorOpen = 'editor' === elementor.getPanelView().getCurrentPageName();

					if ( ! isEditorOpen ) {
						return false;
					}

					var $target = $( event.target );

					if ( $target.is( ':input, .elementor-input' ) ) {
						return false;
					}

					return ! $target.closest( '[contenteditable="true"]' ).length;
				},
				handle: function() {
					elementor.getPanelView().getCurrentPageView().getOption( 'editedElementView' ).removeElement();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.d ] = {
			duplicateElement: {
				isWorthHandling: function( event ) {
					return hotKeysManager.isControlEvent( event );
				},
				handle: function() {
					var panel = elementor.getPanelView();

					if ( 'editor' !== panel.getCurrentPageName() ) {
						return;
					}

					panel.getCurrentPageView().getOption( 'editedElementView' ).duplicate();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.l ] = {
			showTemplateLibrary: {
				isWorthHandling: function( event ) {
					return hotKeysManager.isControlEvent( event ) && event.shiftKey;
				},
				handle: function() {
					elementor.templates.startModal();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.m ] = {
			changeDeviceMode: {
				devices: [ 'desktop', 'tablet', 'mobile' ],
				isWorthHandling: function( event ) {
					return hotKeysManager.isControlEvent( event ) && event.shiftKey;
				},
				handle: function() {
					var currentDeviceMode = elementor.channels.deviceMode.request( 'currentMode' ),
						modeIndex = this.devices.indexOf( currentDeviceMode );

					modeIndex++;

					if ( modeIndex >= this.devices.length ) {
						modeIndex = 0;
					}

					elementor.changeDeviceMode( this.devices[ modeIndex ] );
				}
			}
		};

		hotKeysHandlers[ keysDictionary.p ] = {
			changeEditMode: {
				isWorthHandling: function( event ) {
					return hotKeysManager.isControlEvent( event );
				},
				handle: function() {
					elementor.getPanelView().modeSwitcher.currentView.toggleMode();
				}
			}
		};

		hotKeysHandlers[ keysDictionary.s ] = {
			saveEditor: {
				isWorthHandling: function( event ) {
					return hotKeysManager.isControlEvent( event );
				},
				handle: function() {
					elementor.saver.saveDraft();
				}
			}
		};

		_.each( hotKeysHandlers, function( handlers, keyCode ) {
			_.each( handlers, function( handler, handlerName ) {
				hotKeysManager.addHotKeyHandler( keyCode, handlerName, handler );
			} );
		} );

		hotKeysManager.bindListener( this.$window.add( elementorFrontend.getElements( '$window' ) ) );
	},

	preventClicksInsideEditor: function() {
		this.$previewContents.on( 'click', function( event ) {
			var $target = jQuery( event.target ),
				editMode = elementor.channels.dataEditMode.request( 'activeMode' ),
				isClickInsideElementor = !! $target.closest( '#elementor, .pen-menu' ).length,
				isTargetInsideDocument = this.contains( $target[0] );

			if ( isClickInsideElementor && 'edit' === editMode || ! isTargetInsideDocument ) {
				return;
			}

			if ( $target.closest( 'a:not(.elementor-clickable)' ).length ) {
				event.preventDefault();
			}

			if ( ! isClickInsideElementor ) {
				var panelView = elementor.getPanelView();

				if ( 'elements' !== panelView.getCurrentPageName() ) {
					panelView.setPage( 'elements' );
				}
			}
		} );
	},

	addBackgroundClickArea: function( element ) {
		element.addEventListener( 'click', this.onBackgroundClick.bind( this ), true );
	},

	addBackgroundClickListener: function( key, listener ) {
		this.backgroundClickListeners[ key ] = listener;
	},

	showFatalErrorDialog: function( options ) {
		var defaultOptions = {
			id: 'elementor-fatal-error-dialog',
			headerMessage: '',
			message: '',
			position: {
				my: 'center center',
				at: 'center center'
			},
			strings: {
				confirm: elementor.translate( 'learn_more' ),
				cancel: elementor.translate( 'go_back' )
			},
			onConfirm: null,
			onCancel: function() {
				parent.history.go( -1 );
			},
			hide: {
				onBackgroundClick: false,
				onButtonClick: false
			}
		};

		options = jQuery.extend( true, defaultOptions, options );

		this.dialogsManager.createWidget( 'confirm', options ).show();
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
							var panel = elementor.getPanelView();

							panel.setPage( 'historyPage' );
							panel.getCurrentPageView().activateTab( 'revisions' );
						}
					}
				]
			} );
		}
	},

	openLibraryOnStart: function() {
		if ( '#library' === location.hash ) {
			elementor.templates.startModal();

			location.hash = '';
		}
	},

	onStart: function() {
		this.$window = jQuery( window );

		this.$body = jQuery( 'body' );

		NProgress.start();
		NProgress.inc( 0.2 );

		this.config = ElementorConfig;

		Backbone.Radio.DEBUG = false;
		Backbone.Radio.tuneIn( 'ELEMENTOR' );

		this.initComponents();
		this.initEnvData();

		if ( ! this.checkEnvCompatibility() ) {
			this.onEnvNotCompatible();
		}

		this.channels.dataEditMode.reply( 'activeMode', 'edit' );

		this.listenTo( this.channels.dataEditMode, 'switch', this.onEditModeSwitched );

		this.initClearPageDialog();
		this.addBackgroundClickArea( document );

		this.$window.trigger( 'elementor:init' );

		this.initPreview();
		this.logSite();
	},

	onPreviewLoaded: function() {
		NProgress.done();

		var previewWindow = this.$preview[0].contentWindow;

		if ( ! previewWindow.elementorFrontend ) {
			this.onPreviewLoadingError();

			return;
		}

		this.$previewContents = this.$preview.contents();

		var $previewElementorEl = this.$previewContents.find( '#elementor' );

		if ( ! $previewElementorEl.length ) {
			this.onPreviewElNotFound();

			return;
		}

		this.initFrontend();
		this.initElements();
		this.initHotKeys();

		this.heartbeat.init();

		var iframeRegion = new Marionette.Region( {
			// Make sure you get the DOM object out of the jQuery object
			el: $previewElementorEl[0]
		} );

		this.schemes.init();
		this.schemes.printSchemesStyle();

		this.preventClicksInsideEditor();

		this.addBackgroundClickArea( elementorFrontend.getElements( '$document' )[0] );

		var Preview = require( 'elementor-views/preview' ),
			PanelLayoutView = require( 'elementor-layouts/panel/panel' );

		this.addRegions( {
			sections: iframeRegion,
			panel: '#elementor-panel'
		} );

		this.getRegion( 'sections' ).show( new Preview( {
			collection: this.elements
		} ) );

		this.getRegion( 'panel' ).show( new PanelLayoutView() );

		this.$previewContents.children().addClass( 'elementor-html' );

		elementorFrontend.getElements( '$body' ).addClass( 'elementor-editor-active' );

		if ( ! elementor.userCan( 'design' ) ) {
			elementorFrontend.getElements( '$body' ).addClass( 'elementor-editor-content-only' );
		}

		this.setResizablePanel();
		this.changeDeviceMode( this._defaultDeviceMode );

		jQuery( '#elementor-loading, #elementor-preview-loading' ).fadeOut( 600 );

		_.defer( function() {
			elementorFrontend.getElements( 'window' ).jQuery.holdReady( false );
		} );

		this.enqueueTypographyFonts();
		this.onEditModeSwitched();
		this.openLibraryOnStart();

		this.trigger( 'preview:loaded' );
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
				confirm: elementor.translate( 'proceed_anyway' )
			},
			hide: {
				onButtonClick: true
			},
			onConfirm: function() {
				this.hide();
			}
		} );
	},

	onPreviewLoadingError: function() {
		this.showFatalErrorDialog( {
			headerMessage: this.translate( 'preview_not_loading_header' ),
			message: this.translate( 'preview_not_loading_message' ),
			onConfirm: function() {
				open( elementor.config.help_preview_error_url, '_blank' );
			}
		} );
	},

	onPreviewElNotFound: function() {
		this.showFatalErrorDialog( {
			headerMessage: this.translate( 'preview_el_not_found_header' ),
			message: this.translate( 'preview_el_not_found_message' ),
			onConfirm: function() {
				open( elementor.config.help_the_content_url, '_blank' );
			}
		} );
	},

	onBackgroundClick: function( event ) {
		jQuery.each( this.backgroundClickListeners, function() {
			var elementToHide = this.element,
				$clickedTarget = jQuery( event.target );

			// If it's a label that associated with an input
			if ( $clickedTarget[0].control ) {
				$clickedTarget = $clickedTarget.add( $clickedTarget[0].control );
			}

			if ( this.ignore && $clickedTarget.closest( this.ignore ).length ) {
				return;
			}

			var $clickedTargetClosestElement = $clickedTarget.closest( elementToHide );

			jQuery( elementToHide ).not( $clickedTargetClosestElement ).hide();
		} );
	},

	setResizablePanel: function() {
		var self = this,
			side = elementor.config.is_rtl ? 'right' : 'left';

		self.panel.$el.resizable( {
			handles: elementor.config.is_rtl ? 'w' : 'e',
			minWidth: 200,
			maxWidth: 680,
			start: function() {
				self.$previewWrapper
					.addClass( 'ui-resizable-resizing' )
					.css( 'pointer-events', 'none' );
			},
			stop: function() {
				self.$previewWrapper
					.removeClass( 'ui-resizable-resizing' )
					.css( 'pointer-events', '' );

				elementor.channels.data.trigger( 'scrollbar:update' );
			},
			resize: function( event, ui ) {
				self.$previewWrapper
					.css( side, ui.size.width );
			}
		} );
	},

	enterPreviewMode: function( hidePanel ) {
		var $elements = elementorFrontend.getElements( '$body' );

		if ( hidePanel ) {
			$elements = $elements.add( this.$body );
		}

		$elements
			.removeClass( 'elementor-editor-active' )
			.addClass( 'elementor-editor-preview' );

		if ( hidePanel ) {
			// Handle panel resize
			this.$previewWrapper.css( this.config.is_rtl ? 'right' : 'left', '' );

			this.panel.$el.css( 'width', '' );
		}
	},

	exitPreviewMode: function() {
		elementorFrontend.getElements( '$body' ).add( this.$body )
			.removeClass( 'elementor-editor-preview' )
			.addClass( 'elementor-editor-active' );
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

		this.$preview[0].contentWindow.location.reload( true );
	},

	clearPage: function() {
		this.getClearPageDialog().show();
	},

	changeDeviceMode: function( newDeviceMode ) {
		var oldDeviceMode = this.channels.deviceMode.request( 'currentMode' );

		if ( oldDeviceMode === newDeviceMode ) {
			return;
		}

		this.$body
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
		if ( ! i18nStack ) {
			i18nStack = this.config.i18n;
		}

		var string = i18nStack[ stringKey ];

		if ( undefined === string ) {
			string = stringKey;
		}

		if ( templateArgs ) {
			string = string.replace( /{(\d+)}/g, function( match, number ) {
				return undefined !== templateArgs[ number ] ? templateArgs[ number ] : match;
			} );
		}

		return string;
	},

	compareVersions: function( versionA, versionB, operator ) {
		var prepareVersion = function( version ) {
			version = version + '';

			return version.replace( /[^\d.]+/, '.-1.' );
		};

		versionA  = prepareVersion( versionA );
		versionB = prepareVersion( versionB );

		if ( versionA === versionB ) {
			return ! operator || /^={2,3}$/.test( operator );
		}

		var versionAParts = versionA.split( '.' ).map( Number ),
			versionBParts = versionB.split( '.' ).map( Number ),
			longestVersionParts = Math.max( versionAParts.length, versionBParts.length );

		for ( var i = 0; i < longestVersionParts; i++ ) {
			var valueA = versionAParts[ i ] || 0,
				valueB = versionBParts[ i ] || 0;

			if ( valueA !== valueB ) {
				return this.conditions.compare( valueA, valueB, operator );
			}
		}
	},

	logSite: function() {
		var text = '',
			style = '';

		if ( this.envData.gecko ) {
			var asciiText = [
				' ;;;;;;;;;;;;;;; ',
				';;;  ;;       ;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;       ;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;;;;;;;;;;;',
				';;;  ;;       ;;;',
				' ;;;;;;;;;;;;;;; '
			];

			text += '%c' + asciiText.join( '\n' ) + '\n';

			style = 'color: #C42961';
		} else {
			text += '%c00';

			style = 'line-height: 1.6; font-size: 20px; background-image: url("' + elementor.config.assets_url + 'images/logo-icon.png"); color: transparent; background-repeat: no-repeat; background-size: cover';
		}

		text += '%c\nLove using Elementor? Join our growing community of Elementor developers: %chttps://github.com/pojome/elementor';

		setTimeout( console.log.bind( console, text, style, 'color: #9B0A46', '' ) );
	}
} );

module.exports = ( window.elementor = new App() ).start();

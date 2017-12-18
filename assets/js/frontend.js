(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ElementsHandler;

ElementsHandler = function( $ ) {
	var self = this;

	// element-type.skin-type
	var handlers = {
		// Elements
		'section': require( 'elementor-frontend/handlers/section' ),

		// Widgets
		'accordion.default': require( 'elementor-frontend/handlers/accordion' ),
		'alert.default': require( 'elementor-frontend/handlers/alert' ),
		'counter.default': require( 'elementor-frontend/handlers/counter' ),
		'progress.default': require( 'elementor-frontend/handlers/progress' ),
		'tabs.default': require( 'elementor-frontend/handlers/tabs' ),
		'toggle.default': require( 'elementor-frontend/handlers/toggle' ),
		'video.default': require( 'elementor-frontend/handlers/video' ),
		'image-carousel.default': require( 'elementor-frontend/handlers/image-carousel' ),
		'text-editor.default': require( 'elementor-frontend/handlers/text-editor' )
	};

	var addGlobalHandlers = function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', require( 'elementor-frontend/handlers/global' ) );
		elementorFrontend.hooks.addAction( 'frontend/element_ready/widget', require( 'elementor-frontend/handlers/widget' ) );
	};

	var addElementsHandlers = function() {
		$.each( handlers, function( elementName, funcCallback ) {
			elementorFrontend.hooks.addAction( 'frontend/element_ready/' + elementName, funcCallback );
		} );
	};

	var runElementsHandlers = function() {
		var $elements;

		if ( elementorFrontend.isEditMode() ) {
			// Elements outside from the Preview
			$elements = jQuery( '.elementor-element', '.elementor:not(.elementor-edit-mode)' );
		} else {
			$elements = $( '.elementor-element' );
		}

		$elements.each( function() {
			self.runReadyTrigger( $( this ) );
		} );
	};

	var init = function() {
		if ( ! elementorFrontend.isEditMode() ) {
			self.initHandlers();
		}
	};

	this.initHandlers = function() {
		addGlobalHandlers();

		addElementsHandlers();

		runElementsHandlers();
	};

	this.getHandlers = function( handlerName ) {
		if ( handlerName ) {
			return handlers[ handlerName ];
		}

		return handlers;
	};

	this.runReadyTrigger = function( $scope ) {
		var elementType = $scope.attr( 'data-element_type' );

		if ( ! elementType ) {
			return;
		}

		// Initializing the `$scope` as frontend jQuery instance
		$scope = jQuery( $scope );

		elementorFrontend.hooks.doAction( 'frontend/element_ready/global', $scope, $ );

		var isWidgetType = ( -1 === [ 'section', 'column' ].indexOf( elementType ) );

		if ( isWidgetType ) {
			elementorFrontend.hooks.doAction( 'frontend/element_ready/widget', $scope, $ );
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $scope, $ );
	};

	init();
};

module.exports = ElementsHandler;

},{"elementor-frontend/handlers/accordion":4,"elementor-frontend/handlers/alert":5,"elementor-frontend/handlers/counter":7,"elementor-frontend/handlers/global":8,"elementor-frontend/handlers/image-carousel":9,"elementor-frontend/handlers/progress":10,"elementor-frontend/handlers/section":11,"elementor-frontend/handlers/tabs":12,"elementor-frontend/handlers/text-editor":13,"elementor-frontend/handlers/toggle":14,"elementor-frontend/handlers/video":15,"elementor-frontend/handlers/widget":16}],2:[function(require,module,exports){
/* global elementorFrontendConfig */
( function( $ ) {
	var elements = {},
		EventManager = require( '../utils/hooks' ),
		Module = require( './handler-module' ),
		ElementsHandler = require( 'elementor-frontend/elements-handler' ),
		YouTubeModule = require( 'elementor-frontend/utils/youtube' ),
		AnchorsModule = require( 'elementor-frontend/utils/anchors' ),
		LightboxModule = require( 'elementor-frontend/utils/lightbox' );

	var ElementorFrontend = function() {
		var self = this,
			dialogsManager;

		this.config = elementorFrontendConfig;

		this.Module = Module;

		var setDeviceModeData = function() {
			elements.$body.attr( 'data-elementor-device-mode', self.getCurrentDeviceMode() );
		};

		var initElements = function() {
			elements.window = window;

			elements.$window = $( window );

			elements.$document = $( document );

			elements.$body = $( 'body' );

			elements.$elementor = elements.$document.find( '.elementor' );
		};

		var bindEvents = function() {
			elements.$window.on( 'resize', setDeviceModeData );
		};

		var initOnReadyComponents = function() {
			self.utils = {
				youtube: new YouTubeModule(),
				anchors: new AnchorsModule(),
				lightbox: new LightboxModule()
			};

			self.modules = {
				StretchElement: require( 'elementor-frontend/modules/stretch-element' )
			};

			self.elementsHandler = new ElementsHandler( $ );
		};

		var initHotKeys = function() {
			self.hotKeys = require( 'elementor-utils/hot-keys' );

			self.hotKeys.bindListener( elements.$window );
		};

		var getSiteSettings = function( settingType, settingName ) {
			var settingsObject = self.isEditMode() ? elementor.settings[ settingType ].model.attributes : self.config.settings[ settingType ];

			if ( settingName ) {
				return settingsObject[ settingName ];
			}

			return settingsObject;
		};

		this.init = function() {
			self.hooks = new EventManager();

			initElements();

			bindEvents();

			setDeviceModeData();

			elements.$window.trigger( 'elementor/frontend/init' );

			if ( ! self.isEditMode() ) {
				initHotKeys();
			}

			initOnReadyComponents();
		};

		this.getElements = function( element ) {
			if ( element ) {
				return elements[ element ];
			}

			return elements;
		};

		this.getDialogsManager = function() {
			if ( ! dialogsManager ) {
				dialogsManager = new DialogsManager.Instance();
			}

			return dialogsManager;
		};

		this.getPageSettings = function( settingName ) {
			return getSiteSettings( 'page', settingName );
		};

		this.getGeneralSettings = function( settingName ) {
			return getSiteSettings( 'general', settingName );
		};

		this.isEditMode = function() {
			return self.config.isEditMode;
		};

		// Based on underscore function
		this.throttle = function( func, wait ) {
			var timeout,
				context,
				args,
				result,
				previous = 0;

			var later = function() {
				previous = Date.now();
				timeout = null;
				result = func.apply( context, args );

				if ( ! timeout ) {
					context = args = null;
				}
			};

			return function() {
				var now = Date.now(),
					remaining = wait - ( now - previous );

				context = this;
				args = arguments;

				if ( remaining <= 0 || remaining > wait ) {
					if ( timeout ) {
						clearTimeout( timeout );
						timeout = null;
					}

					previous = now;
					result = func.apply( context, args );

					if ( ! timeout ) {
						context = args = null;
					}
				} else if ( ! timeout ) {
					timeout = setTimeout( later, remaining );
				}

				return result;
			};
		};

		this.addListenerOnce = function( listenerID, event, callback, to ) {
			if ( ! to ) {
				to = self.getElements( '$window' );
			}

			if ( ! self.isEditMode() ) {
				to.on( event, callback );

				return;
			}

			if ( to instanceof jQuery ) {
				var eventNS = event + '.' + listenerID;

				to.off( eventNS ).on( eventNS, callback );
			} else {
				to.off( event, null, listenerID ).on( event, callback, listenerID );
			}
		};

		this.getCurrentDeviceMode = function() {
			return getComputedStyle( elements.$elementor[ 0 ], ':after' ).content.replace( /"/g, '' );
		};

		this.waypoint = function( $element, callback, options ) {
			var defaultOptions = {
				offset: '100%',
				triggerOnce: true
			};

			options = $.extend( defaultOptions, options );

			var correctCallback = function() {
				var element = this.element || this,
					result = callback.apply( element, arguments );

				// If is Waypoint new API and is frontend
				if ( options.triggerOnce && this.destroy ) {
					this.destroy();
				}

				return result;
			};

			return $element.elementorWaypoint( correctCallback, options );
		};
	};

	window.elementorFrontend = new ElementorFrontend();
} )( jQuery );

if ( ! elementorFrontend.isEditMode() ) {
	jQuery( elementorFrontend.init );
}

},{"../utils/hooks":21,"./handler-module":3,"elementor-frontend/elements-handler":1,"elementor-frontend/modules/stretch-element":17,"elementor-frontend/utils/anchors":18,"elementor-frontend/utils/lightbox":19,"elementor-frontend/utils/youtube":20,"elementor-utils/hot-keys":22}],3:[function(require,module,exports){
var ViewModule = require( '../utils/view-module' ),
	HandlerModule;

HandlerModule = ViewModule.extend( {
	$element: null,

	onElementChange: null,

	onEditSettingsChange: null,

	onGeneralSettingsChange: null,

	onPageSettingsChange: null,

	isEdit: null,

	__construct: function( settings ) {
		this.$element  = settings.$element;

		this.isEdit = this.$element.hasClass( 'elementor-element-edit-mode' );

		if ( this.isEdit ) {
			this.addEditorListener();
		}
	},

	findElement: function( selector ) {
		var $mainElement = this.$element;

		return $mainElement.find( selector ).filter( function() {
			return jQuery( this ).closest( '.elementor-element' ).is( $mainElement );
		} );
	},

	getUniqueHandlerID: function( cid, $element ) {
		if ( ! cid ) {
			cid = this.getModelCID();
		}

		if ( ! $element ) {
			$element = this.$element;
		}

		return cid + $element.attr( 'data-element_type' ) + this.getConstructorID();
	},

	addEditorListener: function() {
		var self = this,
			uniqueHandlerID = self.getUniqueHandlerID();

		if ( self.onElementChange ) {
			var elementName = self.getElementName(),
				eventName = 'change';

			if ( 'global' !== elementName ) {
				eventName += ':' + elementName;
			}

			elementorFrontend.addListenerOnce( uniqueHandlerID, eventName, function( controlView, elementView ) {
				var elementViewHandlerID = self.getUniqueHandlerID( elementView.model.cid, elementView.$el );

				if ( elementViewHandlerID !== uniqueHandlerID ) {
					return;
				}

				self.onElementChange( controlView.model.get( 'name' ),  controlView, elementView );
			}, elementor.channels.editor );
		}

		if ( self.onEditSettingsChange ) {
			elementorFrontend.addListenerOnce( uniqueHandlerID, 'change:editSettings', function( changedModel, view ) {
				if ( view.model.cid !== self.getModelCID() ) {
					return;
				}

				self.onEditSettingsChange( Object.keys( changedModel.changed )[0] );
			}, elementor.channels.editor );
		}

		[ 'page', 'general' ].forEach( function( settingsType ) {
			var listenerMethodName = 'on' + settingsType.charAt( 0 ).toUpperCase() + settingsType.slice( 1 ) + 'SettingsChange';

			if ( self[ listenerMethodName ] ) {
				elementorFrontend.addListenerOnce( uniqueHandlerID, 'change', function( model ) {
					self[ listenerMethodName ]( model.changed );
				}, elementor.settings[ settingsType ].model );
			}
		} );
	},

	getElementName: function() {
		return this.$element.data( 'element_type' ).split( '.' )[0];
	},

	getID: function() {
		return this.$element.data( 'id' );
	},

	getModelCID: function() {
		return this.$element.data( 'model-cid' );
	},

	getElementSettings: function( setting ) {
		var elementSettings = {},
			modelCID = this.getModelCID();

		if ( this.isEdit && modelCID ) {
			var settings = elementorFrontend.config.elements.data[ modelCID ],
				settingsKeys = elementorFrontend.config.elements.keys[ settings.attributes.widgetType || settings.attributes.elType ];

			jQuery.each( settings.getActiveControls(), function( controlKey ) {
				if ( -1 !== settingsKeys.indexOf( controlKey ) ) {
					elementSettings[ controlKey ] = settings.attributes[ controlKey ];
				}
			} );
		} else {
			elementSettings = this.$element.data( 'settings' ) || {};
		}

		return this.getItems( elementSettings, setting );
	},

	getEditSettings: function( setting ) {
		var attributes = {};

		if ( this.isEdit ) {
			attributes = elementorFrontend.config.elements.editSettings[ this.getModelCID() ].attributes;
		}

		return this.getItems( attributes, setting );
	}
} );

module.exports = HandlerModule;

},{"../utils/view-module":24}],4:[function(require,module,exports){
var TabsModule = require( 'elementor-frontend/handlers/base-tabs' );

module.exports = function( $scope ) {
	new TabsModule( {
		$element: $scope,
		showTabFn: 'slideDown',
		hideTabFn: 'slideUp'
	} );
};

},{"elementor-frontend/handlers/base-tabs":6}],5:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	$scope.find( '.elementor-alert-dismiss' ).on( 'click', function() {
		$( this ).parent().fadeOut();
	} );
};

},{}],6:[function(require,module,exports){
var HandlerModule = require( 'elementor-frontend/handler-module' );

module.exports = HandlerModule.extend( {
	$activeContent: null,

	getDefaultSettings: function() {
		return {
			selectors: {
				tabTitle: '.elementor-tab-title',
				tabContent: '.elementor-tab-content'
			},
			classes: {
				active: 'elementor-active'
			},
			showTabFn: 'show',
			hideTabFn: 'hide',
			toggleSelf: true,
			hidePrevious: true,
			autoExpand: true
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$tabTitles: this.findElement( selectors.tabTitle ),
			$tabContents: this.findElement( selectors.tabContent )
		};
	},

	activateDefaultTab: function() {
		var settings = this.getSettings();

		if ( ! settings.autoExpand || 'editor' === settings.autoExpand && ! this.isEdit ) {
			return;
		}

		var defaultActiveTab = this.getEditSettings( 'activeItemIndex' ) || 1,
			originalToggleMethods = {
				showTabFn: settings.showTabFn,
				hideTabFn: settings.hideTabFn
			};

		// Toggle tabs without animation to avoid jumping
		this.setSettings( {
			showTabFn: 'show',
			hideTabFn: 'hide'
		} );

		this.changeActiveTab( defaultActiveTab );

		// Return back original toggle effects
		this.setSettings( originalToggleMethods );
	},

	deactivateActiveTab: function( tabIndex ) {
		var settings = this.getSettings(),
			activeClass = settings.classes.active,
			activeFilter = tabIndex ? '[data-tab="' + tabIndex + '"]' : '.' + activeClass,
			$activeTitle = this.elements.$tabTitles.filter( activeFilter ),
			$activeContent = this.elements.$tabContents.filter( activeFilter );

		$activeTitle.add( $activeContent ).removeClass( activeClass );

		$activeContent[ settings.hideTabFn ]();
	},

	activateTab: function( tabIndex ) {
		var settings = this.getSettings(),
			activeClass = settings.classes.active,
			$requestedTitle = this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ),
			$requestedContent = this.elements.$tabContents.filter( '[data-tab="' + tabIndex + '"]' );

		$requestedTitle.add( $requestedContent ).addClass( activeClass );

		$requestedContent[ settings.showTabFn ]();
	},

	isActiveTab: function( tabIndex ) {
		return this.elements.$tabTitles.filter( '[data-tab="' + tabIndex + '"]' ).hasClass( this.getSettings( 'classes.active' ) );
	},

	bindEvents: function() {
		var self = this;

		self.elements.$tabTitles.on( 'focus', function( event ) {
			self.changeActiveTab( event.currentTarget.dataset.tab );
		} );

		if ( self.getSettings( 'toggleSelf' ) ) {
			self.elements.$tabTitles.on( 'mousedown', function( event ) {
				if ( jQuery( event.currentTarget ).is( ':focus' ) ) {
					self.changeActiveTab( event.currentTarget.dataset.tab );
				}
			} );
		}
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.activateDefaultTab();
	},

	onEditSettingsChange: function( propertyName ) {
		if ( 'activeItemIndex' === propertyName ) {
			this.activateDefaultTab();
		}
	},

	changeActiveTab: function( tabIndex ) {
		var isActiveTab = this.isActiveTab( tabIndex ),
			settings = this.getSettings();

		if ( ( settings.toggleSelf || ! isActiveTab ) && settings.hidePrevious ) {
			this.deactivateActiveTab();
		}

		if ( ! settings.hidePrevious && isActiveTab ) {
			this.deactivateActiveTab( tabIndex );
		}

		if ( ! isActiveTab ) {
			this.activateTab( tabIndex );
		}
	}
} );

},{"elementor-frontend/handler-module":3}],7:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	elementorFrontend.waypoint( $scope.find( '.elementor-counter-number' ), function() {
		var $number = $( this ),
			data = $number.data();

		var decimalDigits = data.toValue.toString().match( /\.(.*)/ );

		if ( decimalDigits ) {
			data.rounding = decimalDigits[1].length;
		}

		$number.numerator( data );
	} );
};

},{}],8:[function(require,module,exports){
var HandlerModule = require( 'elementor-frontend/handler-module' ),
	GlobalHandler;

GlobalHandler = HandlerModule.extend( {
	getElementName: function() {
		return 'global';
	},
	animate: function() {
		var $element = this.$element,
			animation = this.getAnimation(),
			elementSettings = this.getElementSettings(),
			animationDelay = elementSettings._animation_delay || elementSettings.animation_delay || 0;

		$element.removeClass( animation );

		setTimeout( function() {
			$element.removeClass( 'elementor-invisible' ).addClass( animation );
		}, animationDelay );
	},
	getAnimation: function() {
		var elementSettings = this.getElementSettings();

		return elementSettings.animation || elementSettings._animation;
	},
	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		var animation = this.getAnimation();

		if ( ! animation ) {
			return;
		}

		this.$element.removeClass( animation );

		elementorFrontend.waypoint( this.$element, this.animate.bind( this ) );
	},
	onElementChange: function( propertyName ) {
		if ( /^_?animation/.test( propertyName ) ) {
			this.animate();
		}
	}
} );

module.exports = function( $scope ) {
	new GlobalHandler( { $element: $scope } );
};

},{"elementor-frontend/handler-module":3}],9:[function(require,module,exports){
var HandlerModule = require( 'elementor-frontend/handler-module' ),
	ImageCarouselHandler;

ImageCarouselHandler = HandlerModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				carousel: '.elementor-image-carousel'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		return {
			$carousel: this.$element.find( selectors.carousel )
		};
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		var elementSettings = this.getElementSettings(),
			slidesToShow = +elementSettings.slides_to_show || 3,
			isSingleSlide = 1 === slidesToShow;

		var slickOptions = {
			slidesToShow: slidesToShow,
			autoplay: 'yes' === elementSettings.autoplay,
			autoplaySpeed: elementSettings.autoplay_speed,
			infinite: 'yes' === elementSettings.infinite,
			pauseOnHover: 'yes' ===  elementSettings.pause_on_hover,
			speed: elementSettings.speed,
			arrows: -1 !== [ 'arrows', 'both' ].indexOf( elementSettings.navigation ),
			dots: -1 !== [ 'dots', 'both' ].indexOf( elementSettings.navigation ),
			rtl: 'rtl' === elementSettings.direction,
			responsive: [
				{
					breakpoint: 1025,
					settings: {
						slidesToShow: +elementSettings.slides_to_show_tablet || ( isSingleSlide ? 1 : 2 ),
						slidesToScroll: 1
					}
				},
				{
					breakpoint: 768,
					settings: {
						slidesToShow: +elementSettings.slides_to_show_mobile || 1,
						slidesToScroll: 1
					}
				}
			]
		};

		if ( isSingleSlide ) {
			slickOptions.fade = 'fade' === elementSettings.effect;
		} else {
			slickOptions.slidesToScroll = +elementSettings.slides_to_scroll;
		}

		this.elements.$carousel.slick( slickOptions );
	}
} );

module.exports = function( $scope ) {
	new ImageCarouselHandler( { $element: $scope } );
};

},{"elementor-frontend/handler-module":3}],10:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	elementorFrontend.waypoint( $scope.find( '.elementor-progress-bar' ), function() {
		var $progressbar = $( this );

		$progressbar.css( 'width', $progressbar.data( 'max' ) + '%' );
	} );
};

},{}],11:[function(require,module,exports){
var HandlerModule = require( 'elementor-frontend/handler-module' );

var BackgroundVideo = HandlerModule.extend( {
	player: null,

	isYTVideo: null,

	getDefaultSettings: function() {
		return {
			selectors: {
				backgroundVideoContainer: '.elementor-background-video-container',
				backgroundVideoEmbed: '.elementor-background-video-embed',
				backgroundVideoHosted: '.elementor-background-video-hosted'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			elements = {
				$backgroundVideoContainer: this.$element.find( selectors.backgroundVideoContainer )
			};

		elements.$backgroundVideoEmbed = elements.$backgroundVideoContainer.children( selectors.backgroundVideoEmbed );

		elements.$backgroundVideoHosted = elements.$backgroundVideoContainer.children( selectors.backgroundVideoHosted );

		return elements;
	},

	calcVideosSize: function() {
		var containerWidth = this.elements.$backgroundVideoContainer.outerWidth(),
			containerHeight = this.elements.$backgroundVideoContainer.outerHeight(),
			aspectRatioSetting = '16:9', //TEMP
			aspectRatioArray = aspectRatioSetting.split( ':' ),
			aspectRatio = aspectRatioArray[ 0 ] / aspectRatioArray[ 1 ],
			ratioWidth = containerWidth / aspectRatio,
			ratioHeight = containerHeight * aspectRatio,
			isWidthFixed = containerWidth / containerHeight > aspectRatio;

		return {
			width: isWidthFixed ? containerWidth : ratioHeight,
			height: isWidthFixed ? ratioWidth : containerHeight
		};
	},

	changeVideoSize: function() {
		var $video = this.isYTVideo ? jQuery( this.player.getIframe() ) : this.elements.$backgroundVideoHosted,
			size = this.calcVideosSize();

		$video.width( size.width ).height( size.height );
	},

	prepareYTVideo: function( YT, videoID ) {
		var self = this,
			$backgroundVideoContainer = self.elements.$backgroundVideoContainer;

		$backgroundVideoContainer.addClass( 'elementor-loading elementor-invisible' );

		self.player = new YT.Player( self.elements.$backgroundVideoEmbed[ 0 ], {
			videoId: videoID,
			events: {
				onReady: function() {
					self.player.mute();

					self.changeVideoSize();

					self.player.playVideo();
				},
				onStateChange: function( event ) {
					switch ( event.data ) {
						case YT.PlayerState.PLAYING:
							$backgroundVideoContainer.removeClass( 'elementor-invisible elementor-loading' );

							break;
						case YT.PlayerState.ENDED:
							self.player.seekTo( 0 );
					}
				}
			},
			playerVars: {
				controls: 0,
				showinfo: 0,
				rel: 0
			}
		} );

		elementorFrontend.getElements( '$window' ).on( 'resize', self.changeVideoSize );
	},

	activate: function() {
		var self = this,
			videoLink = self.getElementSettings( 'background_video_link' ),
			videoID = elementorFrontend.utils.youtube.getYoutubeIDFromURL( videoLink );

		self.isYTVideo = !! videoID;

		if ( videoID ) {
			elementorFrontend.utils.youtube.onYoutubeApiReady( function( YT ) {
				setTimeout( function() {
					self.prepareYTVideo( YT, videoID );
				}, 1 );
			} );
		} else {
			self.elements.$backgroundVideoHosted.attr( 'src', videoLink ).one( 'canplay', self.changeVideoSize );
		}
	},

	deactivate: function() {
		if ( this.isYTVideo && this.player.getIframe() ) {
			this.player.destroy();
		} else {
			this.elements.$backgroundVideoHosted.removeAttr( 'src' );
		}
	},

	run: function() {
		var elementSettings = this.getElementSettings();

		if ( 'video' === elementSettings.background_background && elementSettings.background_video_link ) {
			this.activate();
		} else {
			this.deactivate();
		}
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.run();
	},

	onElementChange: function( propertyName ) {
		if ( 'background_background' === propertyName ) {
			this.run();
		}
	}
} );

var StretchedSection = HandlerModule.extend( {

	stretchElement: null,

	bindEvents: function() {
		elementorFrontend.addListenerOnce( this.$element.data( 'model-cid' ), 'resize', this.stretchSection );
	},

	initStretch: function() {
		this.stretchElement = new elementorFrontend.modules.StretchElement( { element: this.$element } );
	},

	stretchSection: function() {
		var isStretched = this.$element.hasClass( 'elementor-section-stretched' );

		if ( elementorFrontend.isEditMode() || isStretched ) {
			this.stretchElement.reset();
		}

		if ( isStretched ) {
			this.stretchElement.setSettings( 'selectors.container', elementorFrontend.getGeneralSettings( 'elementor_stretched_section_container' ) || window );

			this.stretchElement.stretch();
		}
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.initStretch();

		this.stretchSection();
	},

	onGeneralSettingsChange: function( changed ) {
		if ( 'elementor_stretched_section_container' in changed ) {
			this.stretchSection();
		}
	}
} );

var Shapes = HandlerModule.extend( {

	getDefaultSettings: function() {
		return {
			selectors: {
				container: '> .elementor-shape-%s'
			},
			svgURL: elementorFrontend.config.urls.assets + 'shapes/'
		};
	},

	getDefaultElements: function() {
		var elements = {},
			selectors = this.getSettings( 'selectors' );

		elements.$topContainer = this.$element.find( selectors.container.replace( '%s', 'top' ) );

		elements.$bottomContainer = this.$element.find( selectors.container.replace( '%s', 'bottom' ) );

		return elements;
	},

	buildSVG: function( side ) {
		var self = this,
			baseSettingKey = 'shape_divider_' + side,
			shapeType = self.getElementSettings( baseSettingKey ),
			$svgContainer = this.elements[ '$' + side + 'Container' ];

		$svgContainer.empty().attr( 'data-shape', shapeType );

		if ( ! shapeType ) {
			return;
		}

		var fileName = shapeType;

		if ( self.getElementSettings( baseSettingKey + '_negative' ) ) {
			fileName += '-negative';
		}

		var svgURL = self.getSettings( 'svgURL' ) + fileName + '.svg';

		jQuery.get( svgURL, function( data ) {
			$svgContainer.append( data.childNodes[0] );
		} );

		this.setNegative( side );
	},

	setNegative: function( side ) {
		this.elements[ '$' + side + 'Container' ].attr( 'data-negative', !! this.getElementSettings( 'shape_divider_' + side + '_negative' ) );
	},

	onInit: function() {
		var self = this;

		HandlerModule.prototype.onInit.apply( self, arguments );

		[ 'top', 'bottom' ].forEach( function( side ) {
			if ( self.getElementSettings( 'shape_divider_' + side ) ) {
				self.buildSVG( side );
			}
		} );
	},

	onElementChange: function( propertyName ) {
		var shapeChange = propertyName.match( /^shape_divider_(top|bottom)$/ );

		if ( shapeChange ) {
			this.buildSVG( shapeChange[1] );

			return;
		}

		var negativeChange = propertyName.match( /^shape_divider_(top|bottom)_negative$/ );

		if ( negativeChange ) {
			this.buildSVG( negativeChange[1] );

			this.setNegative( negativeChange[1] );
		}
	}
} );

module.exports = function( $scope ) {
	if ( elementorFrontend.isEditMode() || $scope.hasClass( 'elementor-section-stretched' ) ) {
		new StretchedSection( { $element: $scope } );
	}

	if ( elementorFrontend.isEditMode() ) {
		new Shapes( { $element:  $scope } );
	}

	new BackgroundVideo( { $element: $scope } );
};

},{"elementor-frontend/handler-module":3}],12:[function(require,module,exports){
var TabsModule = require( 'elementor-frontend/handlers/base-tabs' );

module.exports = function( $scope ) {
	new TabsModule( {
		$element: $scope,
		toggleSelf: false
	} );
};

},{"elementor-frontend/handlers/base-tabs":6}],13:[function(require,module,exports){
var HandlerModule = require( 'elementor-frontend/handler-module' ),
	TextEditor;

TextEditor = HandlerModule.extend( {
	dropCapLetter: '',

	getDefaultSettings: function() {
		return {
			selectors: {
				paragraph: 'p:first'
			},
			classes: {
				dropCap: 'elementor-drop-cap',
				dropCapLetter: 'elementor-drop-cap-letter'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' ),
			classes = this.getSettings( 'classes' ),
			$dropCap = jQuery( '<span>', { 'class': classes.dropCap } ),
			$dropCapLetter = jQuery( '<span>', { 'class': classes.dropCapLetter } );

		$dropCap.append( $dropCapLetter );

		return {
			$paragraph: this.$element.find( selectors.paragraph ),
			$dropCap: $dropCap,
			$dropCapLetter: $dropCapLetter
		};
	},

	getElementName: function() {
		return 'text-editor';
	},

	wrapDropCap: function() {
		var isDropCapEnabled = this.getElementSettings( 'drop_cap' );

		if ( ! isDropCapEnabled ) {
			// If there is an old drop cap inside the paragraph
			if ( this.dropCapLetter ) {
				this.elements.$dropCap.remove();

				this.elements.$paragraph.prepend( this.dropCapLetter );

				this.dropCapLetter = '';
			}

			return;
		}

		var $paragraph = this.elements.$paragraph;

		if ( ! $paragraph.length ) {
			return;
		}

		var	paragraphContent = $paragraph.html().replace( /&nbsp;/g, ' ' ),
			firstLetterMatch = paragraphContent.match( /^ *([^ ] ?)/ );

		if ( ! firstLetterMatch ) {
			return;
		}

		var firstLetter = firstLetterMatch[1],
			trimmedFirstLetter = firstLetter.trim();

		// Don't apply drop cap when the content starting with an HTML tag
		if ( '<' === trimmedFirstLetter ) {
			return;
		}

		this.dropCapLetter = firstLetter;

		this.elements.$dropCapLetter.text( trimmedFirstLetter );

		var restoredParagraphContent = paragraphContent.slice( firstLetter.length ).replace( /^ */, function( match ) {
			return new Array( match.length + 1 ).join( '&nbsp;' );
		});

		$paragraph.html( restoredParagraphContent ).prepend( this.elements.$dropCap );
	},

	onInit: function() {
		HandlerModule.prototype.onInit.apply( this, arguments );

		this.wrapDropCap();
	},

	onElementChange: function( propertyName ) {
		if ( 'drop_cap' === propertyName ) {
			this.wrapDropCap();
		}
	}
} );

module.exports = function( $scope ) {
	new TextEditor( { $element: $scope } );
};

},{"elementor-frontend/handler-module":3}],14:[function(require,module,exports){
var TabsModule = require( 'elementor-frontend/handlers/base-tabs' );

module.exports = function( $scope ) {
	new TabsModule( {
		$element: $scope,
		showTabFn: 'slideDown',
		hideTabFn: 'slideUp',
		hidePrevious: false,
		autoExpand: 'editor'
	} );
};

},{"elementor-frontend/handlers/base-tabs":6}],15:[function(require,module,exports){
var HandlerModule = require( 'elementor-frontend/handler-module' ),
	VideoModule;

VideoModule = HandlerModule.extend( {
	getDefaultSettings: function() {
		return {
			selectors: {
				imageOverlay: '.elementor-custom-embed-image-overlay',
				videoWrapper: '.elementor-wrapper',
				videoFrame: 'iframe'
			}
		};
	},

	getDefaultElements: function() {
		var selectors = this.getSettings( 'selectors' );

		var elements = {
			$imageOverlay: this.$element.find( selectors.imageOverlay ),
			$videoWrapper: this.$element.find( selectors.videoWrapper )
		};

		elements.$videoFrame = elements.$videoWrapper.find( selectors.videoFrame );

		return elements;
	},

	getLightBox: function() {
		return elementorFrontend.utils.lightbox;
	},

	handleVideo: function() {
		if ( ! this.getElementSettings( 'lightbox' ) ) {
			this.elements.$imageOverlay.remove();

			this.playVideo();
		}
	},

	playVideo: function() {
		var $videoFrame = this.elements.$videoFrame,
			newSourceUrl = $videoFrame[0].src.replace( '&autoplay=0', '' );

		$videoFrame[0].src = newSourceUrl + '&autoplay=1';
	},

	animateVideo: function() {
		this.getLightBox().setEntranceAnimation( this.getElementSettings( 'lightbox_content_animation' ) );
	},

	handleAspectRatio: function() {
		this.getLightBox().setVideoAspectRatio( this.getElementSettings( 'aspect_ratio' ) );
	},

	bindEvents: function() {
		this.elements.$imageOverlay.on( 'click', this.handleVideo );
	},

	onElementChange: function( propertyName ) {
		if ( 'lightbox_content_animation' === propertyName ) {
			this.animateVideo();

			return;
		}

		var isLightBoxEnabled = this.getElementSettings( 'lightbox' );

		if ( 'lightbox' === propertyName && ! isLightBoxEnabled ) {
			this.getLightBox().getModal().hide();

			return;
		}

		if ( 'aspect_ratio' === propertyName && isLightBoxEnabled ) {
			this.handleAspectRatio();
		}
	}
} );

module.exports = function( $scope ) {
	new VideoModule( { $element: $scope } );
};

},{"elementor-frontend/handler-module":3}],16:[function(require,module,exports){
module.exports = function( $scope, $ ) {
	if ( ! elementorFrontend.isEditMode() ) {
		return;
	}

	if ( $scope.hasClass( 'elementor-widget-edit-disabled' ) ) {
		return;
	}

	$scope.find( '.elementor-element' ).each( function() {
		elementorFrontend.elementsHandler.runReadyTrigger( $( this ) );
	} );
};

},{}],17:[function(require,module,exports){
var ViewModule = require( '../../utils/view-module' );

module.exports = ViewModule.extend( {
	getDefaultSettings: function() {
		return {
			element: null,
			direction: elementorFrontend.config.is_rtl ? 'right' : 'left',
			selectors: {
				container: window
			}
		};
	},

	getDefaultElements: function() {
		return {
			$element: jQuery( this.getSettings( 'element' ) )
		};
	},

	stretch: function() {
		var containerSelector = this.getSettings( 'selectors.container' ),
			$element = this.elements.$element,
			$container = jQuery( containerSelector ),
			isSpecialContainer = window !== $container[0];

		this.reset();

		var containerWidth = $container.outerWidth(),
			elementWidth = $element.outerWidth(),
			elementOffset = $element.offset().left,
			correctOffset = elementOffset;

		if ( isSpecialContainer ) {
			var containerOffset = $container.offset().left;

			if ( elementOffset > containerOffset ) {
				correctOffset = elementOffset - containerOffset;
			} else {
				correctOffset = 0;
			}
		}

		if ( elementorFrontend.config.is_rtl ) {
			correctOffset = containerWidth - ( elementWidth + correctOffset );
		}

		var css = {};

		css.width = containerWidth + 'px';

		css[ this.getSettings( 'direction' ) ] = -correctOffset + 'px';

		$element.css( css );
	},

	reset: function() {
		var css = {};

		css.width = 'auto';

		css[ this.getSettings( 'direction' ) ] = 0;

		this.elements.$element.css( css );
	}
} );

},{"../../utils/view-module":24}],18:[function(require,module,exports){
var ViewModule = require( '../../utils/view-module' );

module.exports = ViewModule.extend( {
	getDefaultSettings: function() {

		return {
			scrollDuration: 500,
			selectors: {
				links: 'a[href*="#"]',
				targets: '.elementor-element, .elementor-menu-anchor',
				scrollable: 'html, body',
				wpAdminBar: '#wpadminbar'
			}
		};
	},

	getDefaultElements: function() {
		var $ = jQuery,
			selectors = this.getSettings( 'selectors' );

		return {
			$scrollable: $( selectors.scrollable ),
			$wpAdminBar: $( selectors.wpAdminBar )
		};
	},

	bindEvents: function() {
		elementorFrontend.getElements( '$document' ).on( 'click', this.getSettings( 'selectors.links' ), this.handleAnchorLinks );
	},

	handleAnchorLinks: function( event ) {
		var clickedLink = event.currentTarget,
			isSamePathname = ( location.pathname === clickedLink.pathname ),
			isSameHostname = ( location.hostname === clickedLink.hostname );

		if ( ! isSameHostname || ! isSamePathname || clickedLink.hash.length < 2 ) {
			return;
		}

		var $anchor = jQuery( clickedLink.hash ).filter( this.getSettings( 'selectors.targets' ) );

		if ( ! $anchor.length ) {
			return;
		}

		var hasAdminBar = ( 1 <= this.elements.$wpAdminBar.length ),
			scrollTop = $anchor.offset().top;

		if ( hasAdminBar ) {
			scrollTop -= this.elements.$wpAdminBar.height();
		}

		event.preventDefault();

		scrollTop = elementorFrontend.hooks.applyFilters( 'frontend/handlers/menu_anchor/scroll_top_distance', scrollTop );

		this.elements.$scrollable.animate( {
			scrollTop: scrollTop
		}, this.getSettings( 'scrollDuration' ), 'linear' );
	},

	onInit: function() {
		ViewModule.prototype.onInit.apply( this, arguments );

		this.bindEvents();
	}
} );

},{"../../utils/view-module":24}],19:[function(require,module,exports){
var ViewModule = require( '../../utils/view-module' ),
	LightboxModule;

LightboxModule = ViewModule.extend( {
	oldAspectRatio: null,

	oldAnimation: null,

	swiper: null,

	getDefaultSettings: function() {
		return {
			classes: {
				aspectRatio: 'elementor-aspect-ratio-%s',
				item: 'elementor-lightbox-item',
				image: 'elementor-lightbox-image',
				videoContainer: 'elementor-video-container',
				videoWrapper: 'elementor-fit-aspect-ratio',
				playButton: 'elementor-custom-embed-play',
				playButtonIcon: 'fa',
				playing: 'elementor-playing',
				hidden: 'elementor-hidden',
				invisible: 'elementor-invisible',
				preventClose: 'elementor-lightbox-prevent-close',
				slideshow: {
					container: 'swiper-container',
					slidesWrapper: 'swiper-wrapper',
					prevButton: 'elementor-swiper-button elementor-swiper-button-prev',
					nextButton: 'elementor-swiper-button elementor-swiper-button-next',
					prevButtonIcon: 'eicon-chevron-left',
					nextButtonIcon: 'eicon-chevron-right',
					slide: 'swiper-slide'
				}
			},
			selectors: {
				links: 'a, [data-elementor-lightbox]',
				slideshow: {
					activeSlide: '.swiper-slide-active',
					prevSlide: '.swiper-slide-prev',
					nextSlide: '.swiper-slide-next'
				}
			},
			modalOptions: {
				id: 'elementor-lightbox',
				entranceAnimation: 'zoomIn',
				videoAspectRatio: 169,
				position: {
					enable: false
				}
			}
		};
	},

	getModal: function() {
		if ( ! LightboxModule.modal ) {
			this.initModal();
		}

		return LightboxModule.modal;
	},

	initModal: function() {
		var modal = LightboxModule.modal = elementorFrontend.getDialogsManager().createWidget( 'lightbox', {
			className: 'elementor-lightbox',
			closeButton: true,
			closeButtonClass: 'eicon-close',
			selectors: {
				preventClose: '.' + this.getSettings( 'classes.preventClose' )
			},
			hide: {
				onClick: true
			}
		} );

		modal.on( 'hide', function() {
			modal.setMessage( '' );
		} );
	},

	showModal: function( options ) {
		var self = this,
			defaultOptions = self.getDefaultSettings().modalOptions;

		self.setSettings( 'modalOptions', jQuery.extend( defaultOptions, options.modalOptions ) );

		var modal = self.getModal();

		modal.setID( self.getSettings( 'modalOptions.id' ) );

		modal.onShow = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onShow.apply( modal, arguments );

			setTimeout( function() {
				self.setEntranceAnimation();
			}, 10 );
		};

		modal.onHide = function() {
			DialogsManager.getWidgetType( 'lightbox' ).prototype.onHide.apply( modal, arguments );

			modal.getElements( 'widgetContent' ).removeClass( 'animated' );
		};

		switch ( options.type ) {
			case 'image':
				self.setImageContent( options.url );

				break;
			case 'video':
				self.setVideoContent( options.url );

				break;
			case 'slideshow':
				self.setSlideshowContent( options.slideshow );

				break;
			default:
				self.setHTMLContent( options.html );
		}

		modal.show();
	},

	setHTMLContent: function( html ) {
		this.getModal().setMessage( html );
	},

	setImageContent: function( imageURL ) {
		var self = this,
			classes = self.getSettings( 'classes' ),
			$item = jQuery( '<div>', { 'class': classes.item } ),
			$image = jQuery( '<img>', { src: imageURL, 'class': classes.image + ' ' + classes.preventClose } );

		$item.append( $image );

		self.getModal().setMessage( $item );
	},

	setVideoContent: function( videoEmbedURL ) {
		videoEmbedURL = videoEmbedURL.replace( '&autoplay=0', '' ) + '&autoplay=1';

		var classes = this.getSettings( 'classes' ),
			$videoContainer = jQuery( '<div>', { 'class': classes.videoContainer } ),
			$videoWrapper = jQuery( '<div>', { 'class': classes.videoWrapper } ),
			$videoFrame = jQuery( '<iframe>', { src: videoEmbedURL, allowfullscreen: 1 } ),
			modal = this.getModal();

		$videoContainer.append( $videoWrapper );

		$videoWrapper.append( $videoFrame );

		modal.setMessage( $videoContainer );

		this.setVideoAspectRatio();

		var onHideMethod = modal.onHide;

		modal.onHide = function() {
			onHideMethod();

			modal.getElements( 'message' ).removeClass( 'elementor-fit-aspect-ratio' );
		};
	},

	setSlideshowContent: function( options ) {
		var $ = jQuery,
			self = this,
			classes = self.getSettings( 'classes' ),
			slideshowClasses = classes.slideshow,
			$container = $( '<div>', { 'class': slideshowClasses.container } ),
			$slidesWrapper = $( '<div>', { 'class': slideshowClasses.slidesWrapper } ),
			$prevButton = $( '<div>', { 'class': slideshowClasses.prevButton + ' ' + classes.preventClose } ).html( $( '<i>', { 'class': slideshowClasses.prevButtonIcon } ) ),
			$nextButton = $( '<div>', { 'class': slideshowClasses.nextButton + ' ' + classes.preventClose } ).html( $( '<i>', { 'class': slideshowClasses.nextButtonIcon } ) );

		options.slides.forEach( function( slide ) {
			var slideClass =  slideshowClasses.slide + ' ' + classes.item;

			if ( slide.video ) {
				slideClass += ' ' + classes.video;
			}

			var $slide = $( '<div>', { 'class': slideClass } );

			if ( slide.video ) {
				$slide.attr( 'data-elementor-slideshow-video', slide.video );

				var $playIcon = $( '<div>', { 'class': classes.playButton } ).html( $( '<i>', { 'class': classes.playButtonIcon } ) );

				$slide.append( $playIcon );
			} else {
				var $zoomContainer = $( '<div>', { 'class': 'swiper-zoom-container' } ),
					$slideImage = $( '<img>', { 'class': classes.image + ' ' + classes.preventClose } ).attr( 'src', slide.image );

				$zoomContainer.append( $slideImage );

				$slide.append( $zoomContainer );
			}

			$slidesWrapper.append( $slide );
		} );

		$container.append(
			$slidesWrapper,
			$prevButton,
			$nextButton
		);

		var modal = self.getModal();

		modal.setMessage( $container );

		var onShowMethod = modal.onShow;

		modal.onShow = function() {
			onShowMethod();

			var swiperOptions = {
				prevButton: $prevButton,
				nextButton: $nextButton,
				paginationClickable: true,
				grabCursor: true,
				onSlideChangeEnd: self.onSlideChange,
				runCallbacksOnInit: false,
				loop: true,
				keyboardControl: true
			};

			if ( options.swiper ) {
				$.extend( swiperOptions, options.swiper );
			}

			self.swiper = new Swiper( $container, swiperOptions );

			self.setVideoAspectRatio();

			self.playSlideVideo();
		};
	},

	setVideoAspectRatio: function( aspectRatio ) {
		aspectRatio = aspectRatio || this.getSettings( 'modalOptions.videoAspectRatio' );

		var $widgetContent = this.getModal().getElements( 'widgetContent' ),
			oldAspectRatio = this.oldAspectRatio,
			aspectRatioClass = this.getSettings( 'classes.aspectRatio' );

		this.oldAspectRatio = aspectRatio;

		if ( oldAspectRatio ) {
			$widgetContent.removeClass( aspectRatioClass.replace( '%s', oldAspectRatio ) );
		}

		if ( aspectRatio ) {
			$widgetContent.addClass( aspectRatioClass.replace( '%s', aspectRatio ) );
		}
	},

	getSlide: function( slideState ) {
		return this.swiper.slides.filter( this.getSettings( 'selectors.slideshow.' + slideState + 'Slide' ) );
	},

	playSlideVideo: function() {
		var $activeSlide = this.getSlide( 'active' ),
			videoURL = $activeSlide.data( 'elementor-slideshow-video' );

		if ( ! videoURL ) {
			return;
		}

		var classes = this.getSettings( 'classes' );

		var $videoContainer = jQuery( '<div>', { 'class': classes.videoContainer + ' ' + classes.invisible } ),
			$videoWrapper = jQuery( '<div>', { 'class': classes.videoWrapper } ),
			$videoFrame = jQuery( '<iframe>', { src: videoURL } ),
			$playIcon = $activeSlide.children( '.' + classes.playButton );

		$videoContainer.append( $videoWrapper );

		$videoWrapper.append( $videoFrame );

		$activeSlide.append( $videoContainer );

		$playIcon.addClass( classes.playing ).removeClass( classes.hidden );

		$videoFrame.on( 'load', function() {
			$playIcon.addClass( classes.hidden );

			$videoContainer.removeClass( classes.invisible );
		} );
	},

	setEntranceAnimation: function( animation ) {
		animation = animation || this.getSettings( 'modalOptions.entranceAnimation' );

		var $widgetMessage = this.getModal().getElements( 'message' );

		if ( this.oldAnimation ) {
			$widgetMessage.removeClass( this.oldAnimation );
		}

		this.oldAnimation = animation;

		if ( animation ) {
			$widgetMessage.addClass( 'animated ' + animation );
		}
	},

	isLightboxLink: function( element ) {
		if ( 'A' === element.tagName && ! /\.(png|jpe?g|gif|svg)$/i.test( element.href ) ) {
			return false;
		}

		var generalOpenInLightbox = elementorFrontend.getGeneralSettings( 'elementor_global_image_lightbox' ),
			currentLinkOpenInLightbox = element.dataset.elementorOpenLightbox;

		return 'yes' === currentLinkOpenInLightbox || generalOpenInLightbox && 'no' !== currentLinkOpenInLightbox;
	},

	openLink: function( event ) {
		var element = event.currentTarget,
			$target = jQuery( event.target ),
			editMode = elementorFrontend.isEditMode(),
			isClickInsideElementor = !! $target.closest( '#elementor' ).length;

		if ( ! this.isLightboxLink( element ) ) {

			if ( editMode && isClickInsideElementor ) {
				event.preventDefault();
			}

			return;
		}

		event.preventDefault();

		if ( elementorFrontend.isEditMode() && ! elementorFrontend.getGeneralSettings( 'elementor_enable_lightbox_in_editor' ) ) {
			return;
		}

		var lightboxData = {};

		if ( element.dataset.elementorLightbox ) {
			lightboxData = JSON.parse( element.dataset.elementorLightbox );
		}

		if ( lightboxData.type && 'slideshow' !== lightboxData.type ) {
			this.showModal( lightboxData );

			return;
		}

		if ( ! element.dataset.elementorLightboxSlideshow ) {
			this.showModal( {
				type: 'image',
				url: element.href
			} );

			return;
		}

		var slideshowID = element.dataset.elementorLightboxSlideshow;

		var $allSlideshowLinks = jQuery( this.getSettings( 'selectors.links' ) ).filter( function() {
			return slideshowID === this.dataset.elementorLightboxSlideshow;
		} );

		var slides = [],
			uniqueLinks = {};

		$allSlideshowLinks.each( function() {
			if ( uniqueLinks[ this.href ] ) {
				return;
			}

			uniqueLinks[ this.href ] = true;

			var slideIndex = this.dataset.elementorLightboxIndex;

			if ( undefined === slideIndex ) {
				slideIndex = $allSlideshowLinks.index( this );
			}

			var slideData = {
				image: this.href,
				index: slideIndex
			};

			if ( this.dataset.elementorLightboxVideo ) {
				slideData.video = this.dataset.elementorLightboxVideo;
			}

			slides.push( slideData );
		} );

		slides.sort( function( a, b ) {
			return a.index - b.index;
		} );

		var initialSlide = element.dataset.elementorLightboxIndex;

		if ( undefined === initialSlide ) {
			initialSlide = $allSlideshowLinks.index( element );
		}

		this.showModal( {
			type: 'slideshow',
			modalOptions: {
				id: 'elementor-lightbox-slideshow-' + slideshowID
			},
			slideshow: {
				slides: slides,
				swiper: {
					initialSlide: +initialSlide
				}
			}
		} );
	},

	bindEvents: function() {
		elementorFrontend.getElements( '$document' ).on( 'click', this.getSettings( 'selectors.links' ), this.openLink );
	},

	onInit: function() {
		ViewModule.prototype.onInit.apply( this, arguments );

		if ( elementorFrontend.isEditMode() ) {
			elementor.settings.general.model.on( 'change', this.onGeneralSettingsChange );
		}
	},

	onGeneralSettingsChange: function( model ) {
		if ( 'elementor_lightbox_content_animation' in model.changed ) {
			this.setSettings( 'modalOptions.entranceAnimation', model.changed.elementor_lightbox_content_animation );

			this.setEntranceAnimation();
		}
	},

	onSlideChange: function() {
		this
			.getSlide( 'prev' )
			.add( this.getSlide( 'next' ) )
			.add( this.getSlide( 'active' ) )
			.find( '.' + this.getSettings( 'classes.videoWrapper' ) )
			.remove();

		this.playSlideVideo();
	}
} );

module.exports = LightboxModule;

},{"../../utils/view-module":24}],20:[function(require,module,exports){
var ViewModule = require( '../../utils/view-module' );

module.exports = ViewModule.extend( {
	getDefaultSettings: function() {
		return {
			isInserted: false,
			APISrc: 'https://www.youtube.com/iframe_api',
			selectors: {
				firstScript: 'script:first'
			}
		};
	},

	getDefaultElements: function() {
		return {
			$firstScript: jQuery( this.getSettings( 'selectors.firstScript' ) )
		};
	},

	insertYTAPI: function() {
		this.setSettings( 'isInserted', true );

		this.elements.$firstScript.before( jQuery( '<script>', { src: this.getSettings( 'APISrc' ) } ) );
	},

	onYoutubeApiReady: function( callback ) {
		var self = this;

		if ( ! self.getSettings( 'IsInserted' ) ) {
			self.insertYTAPI();
		}

		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				self.onYoutubeApiReady( callback );
			}, 350 );
		}
	},

	getYoutubeIDFromURL: function( url ) {
		var videoIDParts = url.match( /^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?vi?=|(?:embed|v|vi|user)\/))([^?&"'>]+)/ );

		return videoIDParts && videoIDParts[1];
	}
} );

},{"../../utils/view-module":24}],21:[function(require,module,exports){
'use strict';

/**
 * Handles managing all events for whatever you plug it into. Priorities for hooks are based on lowest to highest in
 * that, lowest priority hooks are fired first.
 */
var EventManager = function() {
	var slice = Array.prototype.slice,
		MethodsAvailable;

	/**
	 * Contains the hooks that get registered with this EventManager. The array for storage utilizes a "flat"
	 * object literal such that looking up the hook utilizes the native object literal hash.
	 */
	var STORAGE = {
		actions: {},
		filters: {}
	};

	/**
	 * Removes the specified hook by resetting the value of it.
	 *
	 * @param type Type of hook, either 'actions' or 'filters'
	 * @param hook The hook (namespace.identifier) to remove
	 *
	 * @private
	 */
	function _removeHook( type, hook, callback, context ) {
		var handlers, handler, i;

		if ( ! STORAGE[ type ][ hook ] ) {
			return;
		}
		if ( ! callback ) {
			STORAGE[ type ][ hook ] = [];
		} else {
			handlers = STORAGE[ type ][ hook ];
			if ( ! context ) {
				for ( i = handlers.length; i--; ) {
					if ( handlers[ i ].callback === callback ) {
						handlers.splice( i, 1 );
					}
				}
			} else {
				for ( i = handlers.length; i--; ) {
					handler = handlers[ i ];
					if ( handler.callback === callback && handler.context === context ) {
						handlers.splice( i, 1 );
					}
				}
			}
		}
	}

	/**
	 * Use an insert sort for keeping our hooks organized based on priority. This function is ridiculously faster
	 * than bubble sort, etc: http://jsperf.com/javascript-sort
	 *
	 * @param hooks The custom array containing all of the appropriate hooks to perform an insert sort on.
	 * @private
	 */
	function _hookInsertSort( hooks ) {
		var tmpHook, j, prevHook;
		for ( var i = 1, len = hooks.length; i < len; i++ ) {
			tmpHook = hooks[ i ];
			j = i;
			while ( ( prevHook = hooks[ j - 1 ] ) && prevHook.priority > tmpHook.priority ) {
				hooks[ j ] = hooks[ j - 1 ];
				--j;
			}
			hooks[ j ] = tmpHook;
		}

		return hooks;
	}

	/**
	 * Adds the hook to the appropriate storage container
	 *
	 * @param type 'actions' or 'filters'
	 * @param hook The hook (namespace.identifier) to add to our event manager
	 * @param callback The function that will be called when the hook is executed.
	 * @param priority The priority of this hook. Must be an integer.
	 * @param [context] A value to be used for this
	 * @private
	 */
	function _addHook( type, hook, callback, priority, context ) {
		var hookObject = {
			callback: callback,
			priority: priority,
			context: context
		};

		// Utilize 'prop itself' : http://jsperf.com/hasownproperty-vs-in-vs-undefined/19
		var hooks = STORAGE[ type ][ hook ];
		if ( hooks ) {
			// TEMP FIX BUG
			var hasSameCallback = false;
			jQuery.each( hooks, function() {
				if ( this.callback === callback ) {
					hasSameCallback = true;
					return false;
				}
			} );

			if ( hasSameCallback ) {
				return;
			}
			// END TEMP FIX BUG

			hooks.push( hookObject );
			hooks = _hookInsertSort( hooks );
		} else {
			hooks = [ hookObject ];
		}

		STORAGE[ type ][ hook ] = hooks;
	}

	/**
	 * Runs the specified hook. If it is an action, the value is not modified but if it is a filter, it is.
	 *
	 * @param type 'actions' or 'filters'
	 * @param hook The hook ( namespace.identifier ) to be ran.
	 * @param args Arguments to pass to the action/filter. If it's a filter, args is actually a single parameter.
	 * @private
	 */
	function _runHook( type, hook, args ) {
		var handlers = STORAGE[ type ][ hook ], i, len;

		if ( ! handlers ) {
			return ( 'filters' === type ) ? args[ 0 ] : false;
		}

		len = handlers.length;
		if ( 'filters' === type ) {
			for ( i = 0; i < len; i++ ) {
				args[ 0 ] = handlers[ i ].callback.apply( handlers[ i ].context, args );
			}
		} else {
			for ( i = 0; i < len; i++ ) {
				handlers[ i ].callback.apply( handlers[ i ].context, args );
			}
		}

		return ( 'filters' === type ) ? args[ 0 ] : true;
	}

	/**
	 * Adds an action to the event manager.
	 *
	 * @param action Must contain namespace.identifier
	 * @param callback Must be a valid callback function before this action is added
	 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
	 * @param [context] Supply a value to be used for this
	 */
	function addAction( action, callback, priority, context ) {
		if ( 'string' === typeof action && 'function' === typeof callback ) {
			priority = parseInt( ( priority || 10 ), 10 );
			_addHook( 'actions', action, callback, priority, context );
		}

		return MethodsAvailable;
	}

	/**
	 * Performs an action if it exists. You can pass as many arguments as you want to this function; the only rule is
	 * that the first argument must always be the action.
	 */
	function doAction( /* action, arg1, arg2, ... */ ) {
		var args = slice.call( arguments );
		var action = args.shift();

		if ( 'string' === typeof action ) {
			_runHook( 'actions', action, args );
		}

		return MethodsAvailable;
	}

	/**
	 * Removes the specified action if it contains a namespace.identifier & exists.
	 *
	 * @param action The action to remove
	 * @param [callback] Callback function to remove
	 */
	function removeAction( action, callback ) {
		if ( 'string' === typeof action ) {
			_removeHook( 'actions', action, callback );
		}

		return MethodsAvailable;
	}

	/**
	 * Adds a filter to the event manager.
	 *
	 * @param filter Must contain namespace.identifier
	 * @param callback Must be a valid callback function before this action is added
	 * @param [priority=10] Used to control when the function is executed in relation to other callbacks bound to the same hook
	 * @param [context] Supply a value to be used for this
	 */
	function addFilter( filter, callback, priority, context ) {
		if ( 'string' === typeof filter && 'function' === typeof callback ) {
			priority = parseInt( ( priority || 10 ), 10 );
			_addHook( 'filters', filter, callback, priority, context );
		}

		return MethodsAvailable;
	}

	/**
	 * Performs a filter if it exists. You should only ever pass 1 argument to be filtered. The only rule is that
	 * the first argument must always be the filter.
	 */
	function applyFilters( /* filter, filtered arg, arg2, ... */ ) {
		var args = slice.call( arguments );
		var filter = args.shift();

		if ( 'string' === typeof filter ) {
			return _runHook( 'filters', filter, args );
		}

		return MethodsAvailable;
	}

	/**
	 * Removes the specified filter if it contains a namespace.identifier & exists.
	 *
	 * @param filter The action to remove
	 * @param [callback] Callback function to remove
	 */
	function removeFilter( filter, callback ) {
		if ( 'string' === typeof filter ) {
			_removeHook( 'filters', filter, callback );
		}

		return MethodsAvailable;
	}

	/**
	 * Maintain a reference to the object scope so our public methods never get confusing.
	 */
	MethodsAvailable = {
		removeFilter: removeFilter,
		applyFilters: applyFilters,
		addFilter: addFilter,
		removeAction: removeAction,
		doAction: doAction,
		addAction: addAction
	};

	// return all of the publicly available methods
	return MethodsAvailable;
};

module.exports = EventManager;

},{}],22:[function(require,module,exports){
var HotKeys = function() {
	var hotKeysHandlers = this.hotKeysHandlers = {};

	var isMac = function() {
		return -1 !== navigator.userAgent.indexOf( 'Mac OS X' );
	};

	var applyHotKey = function( event ) {
		var handlers = hotKeysHandlers[ event.which ];

		if ( ! handlers ) {
			return;
		}

		jQuery.each( handlers, function() {
			var handler = this;

			if ( handler.isWorthHandling && ! handler.isWorthHandling( event ) ) {
				return;
			}

			// Fix for some keyboard sources that consider alt key as ctrl key
			if ( ! handler.allowAltKey && event.altKey ) {
				return;
			}

			event.preventDefault();

			handler.handle( event );
		} );
	};

	this.isControlEvent = function( event ) {
		return event[ isMac() ? 'metaKey' : 'ctrlKey' ];
	};

	this.addHotKeyHandler = function( keyCode, handlerName, handler ) {
		if ( ! hotKeysHandlers[ keyCode ] ) {
			hotKeysHandlers[ keyCode ] = {};
		}

		hotKeysHandlers[ keyCode ][ handlerName ] = handler;
	};

	this.bindListener = function( $listener ) {
		$listener.on( 'keydown', applyHotKey );
	};
};

module.exports = new HotKeys();

},{}],23:[function(require,module,exports){
var Module = function() {
	var $ = jQuery,
		instanceParams = arguments,
		self = this,
		settings,
		events = {};

	var ensureClosureMethods = function() {
		$.each( self, function( methodName ) {
			var oldMethod = self[ methodName ];

			if ( 'function' !== typeof oldMethod ) {
				return;
			}

			self[ methodName ] = function() {
				return oldMethod.apply( self, arguments );
			};
		});
	};

	var initSettings = function() {
		settings = self.getDefaultSettings();

		var instanceSettings = instanceParams[0];

		if ( instanceSettings ) {
			$.extend( settings, instanceSettings );
		}
	};

	var init = function() {
		self.__construct.apply( self, instanceParams );

		ensureClosureMethods();

		initSettings();

		self.trigger( 'init' );
	};

	this.getItems = function( items, itemKey ) {
		if ( itemKey ) {
			var keyStack = itemKey.split( '.' ),
				currentKey = keyStack.splice( 0, 1 );

			if ( ! keyStack.length ) {
				return items[ currentKey ];
			}

			if ( ! items[ currentKey ] ) {
				return;
			}

			return this.getItems(  items[ currentKey ], keyStack.join( '.' ) );
		}

		return items;
	};

	this.getSettings = function( setting ) {
		return this.getItems( settings, setting );
	};

	this.setSettings = function( settingKey, value, settingsContainer ) {
		if ( ! settingsContainer ) {
			settingsContainer = settings;
		}

		if ( 'object' === typeof settingKey ) {
			$.extend( settingsContainer, settingKey );

			return self;
		}

		var keyStack = settingKey.split( '.' ),
			currentKey = keyStack.splice( 0, 1 );

		if ( ! keyStack.length ) {
			settingsContainer[ currentKey ] = value;

			return self;
		}

		if ( ! settingsContainer[ currentKey ] ) {
			settingsContainer[ currentKey ] = {};
		}

		return self.setSettings( keyStack.join( '.' ), value, settingsContainer[ currentKey ] );
	};

	this.forceMethodImplementation = function( methodArguments ) {
		var functionName = methodArguments.callee.name;

		throw new ReferenceError( 'The method ' + functionName + ' must to be implemented in the inheritor child.' );
	};

	this.on = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			events[ eventName ] = [];
		}

		events[ eventName ].push( callback );

		return self;
	};

	this.off = function( eventName, callback ) {
		if ( ! events[ eventName ] ) {
			return self;
		}

		if ( ! callback ) {
			delete events[ eventName ];

			return self;
		}

		var callbackIndex = events[ eventName ].indexOf( callback );

		if ( -1 !== callbackIndex ) {
			delete events[ eventName ][ callbackIndex ];
		}

		return self;
	};

	this.trigger = function( eventName ) {
		var methodName = 'on' + eventName[ 0 ].toUpperCase() + eventName.slice( 1 ),
			params = Array.prototype.slice.call( arguments, 1 );

		if ( self[ methodName ] ) {
			self[ methodName ].apply( self, params );
		}

		var callbacks = events[ eventName ];

		if ( ! callbacks ) {
			return self;
		}

		$.each( callbacks, function( index, callback ) {
			callback.apply( self, params );
		} );

		return self;
	};

	init();
};

Module.prototype.__construct = function() {};

Module.prototype.getDefaultSettings = function() {
	return {};
};

Module.extendsCount = 0;

Module.extend = function( properties ) {
	var $ = jQuery,
		parent = this;

	var child = function() {
		return parent.apply( this, arguments );
	};

	$.extend( child, parent );

	child.prototype = Object.create( $.extend( {}, parent.prototype, properties ) );

	child.prototype.constructor = child;

	/*
	 * Constructor ID is used to set an unique ID
     * to every extend of the Module.
     *
	 * It's useful in some cases such as unique
	 * listener for frontend handlers.
	 */
	var constructorID = ++Module.extendsCount;

	child.prototype.getConstructorID = function() {
		return constructorID;
	};

	child.__super__ = parent.prototype;

	return child;
};

module.exports = Module;

},{}],24:[function(require,module,exports){
var Module = require( './module' ),
	ViewModule;

ViewModule = Module.extend( {
	elements: null,

	getDefaultElements: function() {
		return {};
	},

	bindEvents: function() {},

	onInit: function() {
		this.initElements();

		this.bindEvents();
	},

	initElements: function() {
		this.elements = this.getDefaultElements();
	}
} );

module.exports = ViewModule;

},{"./module":23}]},{},[2])
//# sourceMappingURL=frontend.js.map

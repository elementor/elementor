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
			var correctCallback = function() {
				var element = this.element || this;

				return callback.apply( element, arguments );
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
	}, { offset: '90%' } );
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
		var self = this;

		HandlerModule.prototype.onInit.apply( self, arguments );

		if ( ! self.getAnimation() ) {
			return;
		}

		var waypoint = elementorFrontend.waypoint( self.$element, function() {
			self.animate();

			if ( waypoint && waypoint[0] && waypoint[0].destroy ) { // If it's Waypoint new API and is frontend
				waypoint[0].destroy();
			}
		}, { offset: '90%' } );
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
	}, { offset: '90%' } );
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
		if ( 'object' === typeof eventName ) {
			$.each( eventName, function( singleEventName ) {
				self.on( singleEventName, this );
			} );

			return self;
		}

		var eventNames = eventName.split( ' ' );

		eventNames.forEach( function( singleEventName ) {
			if ( ! events[ singleEventName ] ) {
				events[ singleEventName ] = [];
			}

			events[ singleEventName ].push( callback );
		} );

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2VsZW1lbnRzLWhhbmRsZXIuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2Zyb250ZW5kLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVyLW1vZHVsZS5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvYWNjb3JkaW9uLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9hbGVydC5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvYmFzZS10YWJzLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9jb3VudGVyLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9nbG9iYWwuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL2ltYWdlLWNhcm91c2VsLmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC9oYW5kbGVycy9wcm9ncmVzcy5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvc2VjdGlvbi5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdGFicy5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdGV4dC1lZGl0b3IuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3RvZ2dsZS5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvaGFuZGxlcnMvdmlkZW8uanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL2hhbmRsZXJzL3dpZGdldC5qcyIsImFzc2V0cy9kZXYvanMvZnJvbnRlbmQvbW9kdWxlcy9zdHJldGNoLWVsZW1lbnQuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL3V0aWxzL2FuY2hvcnMuanMiLCJhc3NldHMvZGV2L2pzL2Zyb250ZW5kL3V0aWxzL2xpZ2h0Ym94LmpzIiwiYXNzZXRzL2Rldi9qcy9mcm9udGVuZC91dGlscy95b3V0dWJlLmpzIiwiYXNzZXRzL2Rldi9qcy91dGlscy9ob29rcy5qcyIsImFzc2V0cy9kZXYvanMvdXRpbHMvaG90LWtleXMuanMiLCJhc3NldHMvZGV2L2pzL3V0aWxzL21vZHVsZS5qcyIsImFzc2V0cy9kZXYvanMvdXRpbHMvdmlldy1tb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNSQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuY0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIEVsZW1lbnRzSGFuZGxlcjtcblxuRWxlbWVudHNIYW5kbGVyID0gZnVuY3Rpb24oICQgKSB7XG5cdHZhciBzZWxmID0gdGhpcztcblxuXHQvLyBlbGVtZW50LXR5cGUuc2tpbi10eXBlXG5cdHZhciBoYW5kbGVycyA9IHtcblx0XHQvLyBFbGVtZW50c1xuXHRcdCdzZWN0aW9uJzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9zZWN0aW9uJyApLFxuXG5cdFx0Ly8gV2lkZ2V0c1xuXHRcdCdhY2NvcmRpb24uZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvYWNjb3JkaW9uJyApLFxuXHRcdCdhbGVydC5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9hbGVydCcgKSxcblx0XHQnY291bnRlci5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9jb3VudGVyJyApLFxuXHRcdCdwcm9ncmVzcy5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy9wcm9ncmVzcycgKSxcblx0XHQndGFicy5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy90YWJzJyApLFxuXHRcdCd0b2dnbGUuZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvdG9nZ2xlJyApLFxuXHRcdCd2aWRlby5kZWZhdWx0JzogcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy92aWRlbycgKSxcblx0XHQnaW1hZ2UtY2Fyb3VzZWwuZGVmYXVsdCc6IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvaW1hZ2UtY2Fyb3VzZWwnICksXG5cdFx0J3RleHQtZWRpdG9yLmRlZmF1bHQnOiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL3RleHQtZWRpdG9yJyApXG5cdH07XG5cblx0dmFyIGFkZEdsb2JhbEhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQuaG9va3MuYWRkQWN0aW9uKCAnZnJvbnRlbmQvZWxlbWVudF9yZWFkeS9nbG9iYWwnLCByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2dsb2JhbCcgKSApO1xuXHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmFkZEFjdGlvbiggJ2Zyb250ZW5kL2VsZW1lbnRfcmVhZHkvd2lkZ2V0JywgcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVycy93aWRnZXQnICkgKTtcblx0fTtcblxuXHR2YXIgYWRkRWxlbWVudHNIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdCQuZWFjaCggaGFuZGxlcnMsIGZ1bmN0aW9uKCBlbGVtZW50TmFtZSwgZnVuY0NhbGxiYWNrICkge1xuXHRcdFx0ZWxlbWVudG9yRnJvbnRlbmQuaG9va3MuYWRkQWN0aW9uKCAnZnJvbnRlbmQvZWxlbWVudF9yZWFkeS8nICsgZWxlbWVudE5hbWUsIGZ1bmNDYWxsYmFjayApO1xuXHRcdH0gKTtcblx0fTtcblxuXHR2YXIgcnVuRWxlbWVudHNIYW5kbGVycyA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkZWxlbWVudHM7XG5cblx0XHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcblx0XHRcdC8vIEVsZW1lbnRzIG91dHNpZGUgZnJvbSB0aGUgUHJldmlld1xuXHRcdFx0JGVsZW1lbnRzID0galF1ZXJ5KCAnLmVsZW1lbnRvci1lbGVtZW50JywgJy5lbGVtZW50b3I6bm90KC5lbGVtZW50b3ItZWRpdC1tb2RlKScgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGVsZW1lbnRzID0gJCggJy5lbGVtZW50b3ItZWxlbWVudCcgKTtcblx0XHR9XG5cblx0XHQkZWxlbWVudHMuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLnJ1blJlYWR5VHJpZ2dlciggJCggdGhpcyApICk7XG5cdFx0fSApO1xuXHR9O1xuXG5cdHZhciBpbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAhIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcblx0XHRcdHNlbGYuaW5pdEhhbmRsZXJzKCk7XG5cdFx0fVxuXHR9O1xuXG5cdHRoaXMuaW5pdEhhbmRsZXJzID0gZnVuY3Rpb24oKSB7XG5cdFx0YWRkR2xvYmFsSGFuZGxlcnMoKTtcblxuXHRcdGFkZEVsZW1lbnRzSGFuZGxlcnMoKTtcblxuXHRcdHJ1bkVsZW1lbnRzSGFuZGxlcnMoKTtcblx0fTtcblxuXHR0aGlzLmdldEhhbmRsZXJzID0gZnVuY3Rpb24oIGhhbmRsZXJOYW1lICkge1xuXHRcdGlmICggaGFuZGxlck5hbWUgKSB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlcnNbIGhhbmRsZXJOYW1lIF07XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGhhbmRsZXJzO1xuXHR9O1xuXG5cdHRoaXMucnVuUmVhZHlUcmlnZ2VyID0gZnVuY3Rpb24oICRzY29wZSApIHtcblx0XHR2YXIgZWxlbWVudFR5cGUgPSAkc2NvcGUuYXR0ciggJ2RhdGEtZWxlbWVudF90eXBlJyApO1xuXG5cdFx0aWYgKCAhIGVsZW1lbnRUeXBlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEluaXRpYWxpemluZyB0aGUgYCRzY29wZWAgYXMgZnJvbnRlbmQgalF1ZXJ5IGluc3RhbmNlXG5cdFx0JHNjb3BlID0galF1ZXJ5KCAkc2NvcGUgKTtcblxuXHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmRvQWN0aW9uKCAnZnJvbnRlbmQvZWxlbWVudF9yZWFkeS9nbG9iYWwnLCAkc2NvcGUsICQgKTtcblxuXHRcdHZhciBpc1dpZGdldFR5cGUgPSAoIC0xID09PSBbICdzZWN0aW9uJywgJ2NvbHVtbicgXS5pbmRleE9mKCBlbGVtZW50VHlwZSApICk7XG5cblx0XHRpZiAoIGlzV2lkZ2V0VHlwZSApIHtcblx0XHRcdGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmRvQWN0aW9uKCAnZnJvbnRlbmQvZWxlbWVudF9yZWFkeS93aWRnZXQnLCAkc2NvcGUsICQgKTtcblx0XHR9XG5cblx0XHRlbGVtZW50b3JGcm9udGVuZC5ob29rcy5kb0FjdGlvbiggJ2Zyb250ZW5kL2VsZW1lbnRfcmVhZHkvJyArIGVsZW1lbnRUeXBlLCAkc2NvcGUsICQgKTtcblx0fTtcblxuXHRpbml0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVsZW1lbnRzSGFuZGxlcjtcbiIsIi8qIGdsb2JhbCBlbGVtZW50b3JGcm9udGVuZENvbmZpZyAqL1xuKCBmdW5jdGlvbiggJCApIHtcblx0dmFyIGVsZW1lbnRzID0ge30sXG5cdFx0RXZlbnRNYW5hZ2VyID0gcmVxdWlyZSggJy4uL3V0aWxzL2hvb2tzJyApLFxuXHRcdE1vZHVsZSA9IHJlcXVpcmUoICcuL2hhbmRsZXItbW9kdWxlJyApLFxuXHRcdEVsZW1lbnRzSGFuZGxlciA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvZWxlbWVudHMtaGFuZGxlcicgKSxcblx0XHRZb3VUdWJlTW9kdWxlID0gcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC91dGlscy95b3V0dWJlJyApLFxuXHRcdEFuY2hvcnNNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL3V0aWxzL2FuY2hvcnMnICksXG5cdFx0TGlnaHRib3hNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL3V0aWxzL2xpZ2h0Ym94JyApO1xuXG5cdHZhciBFbGVtZW50b3JGcm9udGVuZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdGRpYWxvZ3NNYW5hZ2VyO1xuXG5cdFx0dGhpcy5jb25maWcgPSBlbGVtZW50b3JGcm9udGVuZENvbmZpZztcblxuXHRcdHRoaXMuTW9kdWxlID0gTW9kdWxlO1xuXG5cdFx0dmFyIHNldERldmljZU1vZGVEYXRhID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRlbGVtZW50cy4kYm9keS5hdHRyKCAnZGF0YS1lbGVtZW50b3ItZGV2aWNlLW1vZGUnLCBzZWxmLmdldEN1cnJlbnREZXZpY2VNb2RlKCkgKTtcblx0XHR9O1xuXG5cdFx0dmFyIGluaXRFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0ZWxlbWVudHMud2luZG93ID0gd2luZG93O1xuXG5cdFx0XHRlbGVtZW50cy4kd2luZG93ID0gJCggd2luZG93ICk7XG5cblx0XHRcdGVsZW1lbnRzLiRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICk7XG5cblx0XHRcdGVsZW1lbnRzLiRib2R5ID0gJCggJ2JvZHknICk7XG5cblx0XHRcdGVsZW1lbnRzLiRlbGVtZW50b3IgPSBlbGVtZW50cy4kZG9jdW1lbnQuZmluZCggJy5lbGVtZW50b3InICk7XG5cdFx0fTtcblxuXHRcdHZhciBiaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRlbGVtZW50cy4kd2luZG93Lm9uKCAncmVzaXplJywgc2V0RGV2aWNlTW9kZURhdGEgKTtcblx0XHR9O1xuXG5cdFx0dmFyIGluaXRPblJlYWR5Q29tcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0c2VsZi51dGlscyA9IHtcblx0XHRcdFx0eW91dHViZTogbmV3IFlvdVR1YmVNb2R1bGUoKSxcblx0XHRcdFx0YW5jaG9yczogbmV3IEFuY2hvcnNNb2R1bGUoKSxcblx0XHRcdFx0bGlnaHRib3g6IG5ldyBMaWdodGJveE1vZHVsZSgpXG5cdFx0XHR9O1xuXG5cdFx0XHRzZWxmLm1vZHVsZXMgPSB7XG5cdFx0XHRcdFN0cmV0Y2hFbGVtZW50OiByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL21vZHVsZXMvc3RyZXRjaC1lbGVtZW50JyApXG5cdFx0XHR9O1xuXG5cdFx0XHRzZWxmLmVsZW1lbnRzSGFuZGxlciA9IG5ldyBFbGVtZW50c0hhbmRsZXIoICQgKTtcblx0XHR9O1xuXG5cdFx0dmFyIGluaXRIb3RLZXlzID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmhvdEtleXMgPSByZXF1aXJlKCAnZWxlbWVudG9yLXV0aWxzL2hvdC1rZXlzJyApO1xuXG5cdFx0XHRzZWxmLmhvdEtleXMuYmluZExpc3RlbmVyKCBlbGVtZW50cy4kd2luZG93ICk7XG5cdFx0fTtcblxuXHRcdHZhciBnZXRTaXRlU2V0dGluZ3MgPSBmdW5jdGlvbiggc2V0dGluZ1R5cGUsIHNldHRpbmdOYW1lICkge1xuXHRcdFx0dmFyIHNldHRpbmdzT2JqZWN0ID0gc2VsZi5pc0VkaXRNb2RlKCkgPyBlbGVtZW50b3Iuc2V0dGluZ3NbIHNldHRpbmdUeXBlIF0ubW9kZWwuYXR0cmlidXRlcyA6IHNlbGYuY29uZmlnLnNldHRpbmdzWyBzZXR0aW5nVHlwZSBdO1xuXG5cdFx0XHRpZiAoIHNldHRpbmdOYW1lICkge1xuXHRcdFx0XHRyZXR1cm4gc2V0dGluZ3NPYmplY3RbIHNldHRpbmdOYW1lIF07XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBzZXR0aW5nc09iamVjdDtcblx0XHR9O1xuXG5cdFx0dGhpcy5pbml0ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRzZWxmLmhvb2tzID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuXG5cdFx0XHRpbml0RWxlbWVudHMoKTtcblxuXHRcdFx0YmluZEV2ZW50cygpO1xuXG5cdFx0XHRzZXREZXZpY2VNb2RlRGF0YSgpO1xuXG5cdFx0XHRlbGVtZW50cy4kd2luZG93LnRyaWdnZXIoICdlbGVtZW50b3IvZnJvbnRlbmQvaW5pdCcgKTtcblxuXHRcdFx0aWYgKCAhIHNlbGYuaXNFZGl0TW9kZSgpICkge1xuXHRcdFx0XHRpbml0SG90S2V5cygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpbml0T25SZWFkeUNvbXBvbmVudHMoKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5nZXRFbGVtZW50cyA9IGZ1bmN0aW9uKCBlbGVtZW50ICkge1xuXHRcdFx0aWYgKCBlbGVtZW50ICkge1xuXHRcdFx0XHRyZXR1cm4gZWxlbWVudHNbIGVsZW1lbnQgXTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGVsZW1lbnRzO1xuXHRcdH07XG5cblx0XHR0aGlzLmdldERpYWxvZ3NNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoICEgZGlhbG9nc01hbmFnZXIgKSB7XG5cdFx0XHRcdGRpYWxvZ3NNYW5hZ2VyID0gbmV3IERpYWxvZ3NNYW5hZ2VyLkluc3RhbmNlKCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBkaWFsb2dzTWFuYWdlcjtcblx0XHR9O1xuXG5cdFx0dGhpcy5nZXRQYWdlU2V0dGluZ3MgPSBmdW5jdGlvbiggc2V0dGluZ05hbWUgKSB7XG5cdFx0XHRyZXR1cm4gZ2V0U2l0ZVNldHRpbmdzKCAncGFnZScsIHNldHRpbmdOYW1lICk7XG5cdFx0fTtcblxuXHRcdHRoaXMuZ2V0R2VuZXJhbFNldHRpbmdzID0gZnVuY3Rpb24oIHNldHRpbmdOYW1lICkge1xuXHRcdFx0cmV0dXJuIGdldFNpdGVTZXR0aW5ncyggJ2dlbmVyYWwnLCBzZXR0aW5nTmFtZSApO1xuXHRcdH07XG5cblx0XHR0aGlzLmlzRWRpdE1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzZWxmLmNvbmZpZy5pc0VkaXRNb2RlO1xuXHRcdH07XG5cblx0XHQvLyBCYXNlZCBvbiB1bmRlcnNjb3JlIGZ1bmN0aW9uXG5cdFx0dGhpcy50aHJvdHRsZSA9IGZ1bmN0aW9uKCBmdW5jLCB3YWl0ICkge1xuXHRcdFx0dmFyIHRpbWVvdXQsXG5cdFx0XHRcdGNvbnRleHQsXG5cdFx0XHRcdGFyZ3MsXG5cdFx0XHRcdHJlc3VsdCxcblx0XHRcdFx0cHJldmlvdXMgPSAwO1xuXG5cdFx0XHR2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0cHJldmlvdXMgPSBEYXRlLm5vdygpO1xuXHRcdFx0XHR0aW1lb3V0ID0gbnVsbDtcblx0XHRcdFx0cmVzdWx0ID0gZnVuYy5hcHBseSggY29udGV4dCwgYXJncyApO1xuXG5cdFx0XHRcdGlmICggISB0aW1lb3V0ICkge1xuXHRcdFx0XHRcdGNvbnRleHQgPSBhcmdzID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgbm93ID0gRGF0ZS5ub3coKSxcblx0XHRcdFx0XHRyZW1haW5pbmcgPSB3YWl0IC0gKCBub3cgLSBwcmV2aW91cyApO1xuXG5cdFx0XHRcdGNvbnRleHQgPSB0aGlzO1xuXHRcdFx0XHRhcmdzID0gYXJndW1lbnRzO1xuXG5cdFx0XHRcdGlmICggcmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCApIHtcblx0XHRcdFx0XHRpZiAoIHRpbWVvdXQgKSB7XG5cdFx0XHRcdFx0XHRjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcblx0XHRcdFx0XHRcdHRpbWVvdXQgPSBudWxsO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHByZXZpb3VzID0gbm93O1xuXHRcdFx0XHRcdHJlc3VsdCA9IGZ1bmMuYXBwbHkoIGNvbnRleHQsIGFyZ3MgKTtcblxuXHRcdFx0XHRcdGlmICggISB0aW1lb3V0ICkge1xuXHRcdFx0XHRcdFx0Y29udGV4dCA9IGFyZ3MgPSBudWxsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmICggISB0aW1lb3V0ICkge1xuXHRcdFx0XHRcdHRpbWVvdXQgPSBzZXRUaW1lb3V0KCBsYXRlciwgcmVtYWluaW5nICk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gcmVzdWx0O1xuXHRcdFx0fTtcblx0XHR9O1xuXG5cdFx0dGhpcy5hZGRMaXN0ZW5lck9uY2UgPSBmdW5jdGlvbiggbGlzdGVuZXJJRCwgZXZlbnQsIGNhbGxiYWNrLCB0byApIHtcblx0XHRcdGlmICggISB0byApIHtcblx0XHRcdFx0dG8gPSBzZWxmLmdldEVsZW1lbnRzKCAnJHdpbmRvdycgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCAhIHNlbGYuaXNFZGl0TW9kZSgpICkge1xuXHRcdFx0XHR0by5vbiggZXZlbnQsIGNhbGxiYWNrICk7XG5cblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIHRvIGluc3RhbmNlb2YgalF1ZXJ5ICkge1xuXHRcdFx0XHR2YXIgZXZlbnROUyA9IGV2ZW50ICsgJy4nICsgbGlzdGVuZXJJRDtcblxuXHRcdFx0XHR0by5vZmYoIGV2ZW50TlMgKS5vbiggZXZlbnROUywgY2FsbGJhY2sgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRvLm9mZiggZXZlbnQsIG51bGwsIGxpc3RlbmVySUQgKS5vbiggZXZlbnQsIGNhbGxiYWNrLCBsaXN0ZW5lcklEICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMuZ2V0Q3VycmVudERldmljZU1vZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBnZXRDb21wdXRlZFN0eWxlKCBlbGVtZW50cy4kZWxlbWVudG9yWyAwIF0sICc6YWZ0ZXInICkuY29udGVudC5yZXBsYWNlKCAvXCIvZywgJycgKTtcblx0XHR9O1xuXG5cdFx0dGhpcy53YXlwb2ludCA9IGZ1bmN0aW9uKCAkZWxlbWVudCwgY2FsbGJhY2ssIG9wdGlvbnMgKSB7XG5cdFx0XHR2YXIgY29ycmVjdENhbGxiYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBlbGVtZW50ID0gdGhpcy5lbGVtZW50IHx8IHRoaXM7XG5cblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrLmFwcGx5KCBlbGVtZW50LCBhcmd1bWVudHMgKTtcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiAkZWxlbWVudC5lbGVtZW50b3JXYXlwb2ludCggY29ycmVjdENhbGxiYWNrLCBvcHRpb25zICk7XG5cdFx0fTtcblx0fTtcblxuXHR3aW5kb3cuZWxlbWVudG9yRnJvbnRlbmQgPSBuZXcgRWxlbWVudG9yRnJvbnRlbmQoKTtcbn0gKSggalF1ZXJ5ICk7XG5cbmlmICggISBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCkgKSB7XG5cdGpRdWVyeSggZWxlbWVudG9yRnJvbnRlbmQuaW5pdCApO1xufVxuIiwidmFyIFZpZXdNb2R1bGUgPSByZXF1aXJlKCAnLi4vdXRpbHMvdmlldy1tb2R1bGUnICksXG5cdEhhbmRsZXJNb2R1bGU7XG5cbkhhbmRsZXJNb2R1bGUgPSBWaWV3TW9kdWxlLmV4dGVuZCgge1xuXHQkZWxlbWVudDogbnVsbCxcblxuXHRvbkVsZW1lbnRDaGFuZ2U6IG51bGwsXG5cblx0b25FZGl0U2V0dGluZ3NDaGFuZ2U6IG51bGwsXG5cblx0b25HZW5lcmFsU2V0dGluZ3NDaGFuZ2U6IG51bGwsXG5cblx0b25QYWdlU2V0dGluZ3NDaGFuZ2U6IG51bGwsXG5cblx0aXNFZGl0OiBudWxsLFxuXG5cdF9fY29uc3RydWN0OiBmdW5jdGlvbiggc2V0dGluZ3MgKSB7XG5cdFx0dGhpcy4kZWxlbWVudCAgPSBzZXR0aW5ncy4kZWxlbWVudDtcblxuXHRcdHRoaXMuaXNFZGl0ID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcyggJ2VsZW1lbnRvci1lbGVtZW50LWVkaXQtbW9kZScgKTtcblxuXHRcdGlmICggdGhpcy5pc0VkaXQgKSB7XG5cdFx0XHR0aGlzLmFkZEVkaXRvckxpc3RlbmVyKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGZpbmRFbGVtZW50OiBmdW5jdGlvbiggc2VsZWN0b3IgKSB7XG5cdFx0dmFyICRtYWluRWxlbWVudCA9IHRoaXMuJGVsZW1lbnQ7XG5cblx0XHRyZXR1cm4gJG1haW5FbGVtZW50LmZpbmQoIHNlbGVjdG9yICkuZmlsdGVyKCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBqUXVlcnkoIHRoaXMgKS5jbG9zZXN0KCAnLmVsZW1lbnRvci1lbGVtZW50JyApLmlzKCAkbWFpbkVsZW1lbnQgKTtcblx0XHR9ICk7XG5cdH0sXG5cblx0Z2V0VW5pcXVlSGFuZGxlcklEOiBmdW5jdGlvbiggY2lkLCAkZWxlbWVudCApIHtcblx0XHRpZiAoICEgY2lkICkge1xuXHRcdFx0Y2lkID0gdGhpcy5nZXRNb2RlbENJRCgpO1xuXHRcdH1cblxuXHRcdGlmICggISAkZWxlbWVudCApIHtcblx0XHRcdCRlbGVtZW50ID0gdGhpcy4kZWxlbWVudDtcblx0XHR9XG5cblx0XHRyZXR1cm4gY2lkICsgJGVsZW1lbnQuYXR0ciggJ2RhdGEtZWxlbWVudF90eXBlJyApICsgdGhpcy5nZXRDb25zdHJ1Y3RvcklEKCk7XG5cdH0sXG5cblx0YWRkRWRpdG9yTGlzdGVuZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdHVuaXF1ZUhhbmRsZXJJRCA9IHNlbGYuZ2V0VW5pcXVlSGFuZGxlcklEKCk7XG5cblx0XHRpZiAoIHNlbGYub25FbGVtZW50Q2hhbmdlICkge1xuXHRcdFx0dmFyIGVsZW1lbnROYW1lID0gc2VsZi5nZXRFbGVtZW50TmFtZSgpLFxuXHRcdFx0XHRldmVudE5hbWUgPSAnY2hhbmdlJztcblxuXHRcdFx0aWYgKCAnZ2xvYmFsJyAhPT0gZWxlbWVudE5hbWUgKSB7XG5cdFx0XHRcdGV2ZW50TmFtZSArPSAnOicgKyBlbGVtZW50TmFtZTtcblx0XHRcdH1cblxuXHRcdFx0ZWxlbWVudG9yRnJvbnRlbmQuYWRkTGlzdGVuZXJPbmNlKCB1bmlxdWVIYW5kbGVySUQsIGV2ZW50TmFtZSwgZnVuY3Rpb24oIGNvbnRyb2xWaWV3LCBlbGVtZW50VmlldyApIHtcblx0XHRcdFx0dmFyIGVsZW1lbnRWaWV3SGFuZGxlcklEID0gc2VsZi5nZXRVbmlxdWVIYW5kbGVySUQoIGVsZW1lbnRWaWV3Lm1vZGVsLmNpZCwgZWxlbWVudFZpZXcuJGVsICk7XG5cblx0XHRcdFx0aWYgKCBlbGVtZW50Vmlld0hhbmRsZXJJRCAhPT0gdW5pcXVlSGFuZGxlcklEICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNlbGYub25FbGVtZW50Q2hhbmdlKCBjb250cm9sVmlldy5tb2RlbC5nZXQoICduYW1lJyApLCAgY29udHJvbFZpZXcsIGVsZW1lbnRWaWV3ICk7XG5cdFx0XHR9LCBlbGVtZW50b3IuY2hhbm5lbHMuZWRpdG9yICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBzZWxmLm9uRWRpdFNldHRpbmdzQ2hhbmdlICkge1xuXHRcdFx0ZWxlbWVudG9yRnJvbnRlbmQuYWRkTGlzdGVuZXJPbmNlKCB1bmlxdWVIYW5kbGVySUQsICdjaGFuZ2U6ZWRpdFNldHRpbmdzJywgZnVuY3Rpb24oIGNoYW5nZWRNb2RlbCwgdmlldyApIHtcblx0XHRcdFx0aWYgKCB2aWV3Lm1vZGVsLmNpZCAhPT0gc2VsZi5nZXRNb2RlbENJRCgpICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHNlbGYub25FZGl0U2V0dGluZ3NDaGFuZ2UoIE9iamVjdC5rZXlzKCBjaGFuZ2VkTW9kZWwuY2hhbmdlZCApWzBdICk7XG5cdFx0XHR9LCBlbGVtZW50b3IuY2hhbm5lbHMuZWRpdG9yICk7XG5cdFx0fVxuXG5cdFx0WyAncGFnZScsICdnZW5lcmFsJyBdLmZvckVhY2goIGZ1bmN0aW9uKCBzZXR0aW5nc1R5cGUgKSB7XG5cdFx0XHR2YXIgbGlzdGVuZXJNZXRob2ROYW1lID0gJ29uJyArIHNldHRpbmdzVHlwZS5jaGFyQXQoIDAgKS50b1VwcGVyQ2FzZSgpICsgc2V0dGluZ3NUeXBlLnNsaWNlKCAxICkgKyAnU2V0dGluZ3NDaGFuZ2UnO1xuXG5cdFx0XHRpZiAoIHNlbGZbIGxpc3RlbmVyTWV0aG9kTmFtZSBdICkge1xuXHRcdFx0XHRlbGVtZW50b3JGcm9udGVuZC5hZGRMaXN0ZW5lck9uY2UoIHVuaXF1ZUhhbmRsZXJJRCwgJ2NoYW5nZScsIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdFx0XHRzZWxmWyBsaXN0ZW5lck1ldGhvZE5hbWUgXSggbW9kZWwuY2hhbmdlZCApO1xuXHRcdFx0XHR9LCBlbGVtZW50b3Iuc2V0dGluZ3NbIHNldHRpbmdzVHlwZSBdLm1vZGVsICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9LFxuXG5cdGdldEVsZW1lbnROYW1lOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy4kZWxlbWVudC5kYXRhKCAnZWxlbWVudF90eXBlJyApLnNwbGl0KCAnLicgKVswXTtcblx0fSxcblxuXHRnZXRJRDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuJGVsZW1lbnQuZGF0YSggJ2lkJyApO1xuXHR9LFxuXG5cdGdldE1vZGVsQ0lEOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy4kZWxlbWVudC5kYXRhKCAnbW9kZWwtY2lkJyApO1xuXHR9LFxuXG5cdGdldEVsZW1lbnRTZXR0aW5nczogZnVuY3Rpb24oIHNldHRpbmcgKSB7XG5cdFx0dmFyIGVsZW1lbnRTZXR0aW5ncyA9IHt9LFxuXHRcdFx0bW9kZWxDSUQgPSB0aGlzLmdldE1vZGVsQ0lEKCk7XG5cblx0XHRpZiAoIHRoaXMuaXNFZGl0ICYmIG1vZGVsQ0lEICkge1xuXHRcdFx0dmFyIHNldHRpbmdzID0gZWxlbWVudG9yRnJvbnRlbmQuY29uZmlnLmVsZW1lbnRzLmRhdGFbIG1vZGVsQ0lEIF0sXG5cdFx0XHRcdHNldHRpbmdzS2V5cyA9IGVsZW1lbnRvckZyb250ZW5kLmNvbmZpZy5lbGVtZW50cy5rZXlzWyBzZXR0aW5ncy5hdHRyaWJ1dGVzLndpZGdldFR5cGUgfHwgc2V0dGluZ3MuYXR0cmlidXRlcy5lbFR5cGUgXTtcblxuXHRcdFx0alF1ZXJ5LmVhY2goIHNldHRpbmdzLmdldEFjdGl2ZUNvbnRyb2xzKCksIGZ1bmN0aW9uKCBjb250cm9sS2V5ICkge1xuXHRcdFx0XHRpZiAoIC0xICE9PSBzZXR0aW5nc0tleXMuaW5kZXhPZiggY29udHJvbEtleSApICkge1xuXHRcdFx0XHRcdGVsZW1lbnRTZXR0aW5nc1sgY29udHJvbEtleSBdID0gc2V0dGluZ3MuYXR0cmlidXRlc1sgY29udHJvbEtleSBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVsZW1lbnRTZXR0aW5ncyA9IHRoaXMuJGVsZW1lbnQuZGF0YSggJ3NldHRpbmdzJyApIHx8IHt9O1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmdldEl0ZW1zKCBlbGVtZW50U2V0dGluZ3MsIHNldHRpbmcgKTtcblx0fSxcblxuXHRnZXRFZGl0U2V0dGluZ3M6IGZ1bmN0aW9uKCBzZXR0aW5nICkge1xuXHRcdHZhciBhdHRyaWJ1dGVzID0ge307XG5cblx0XHRpZiAoIHRoaXMuaXNFZGl0ICkge1xuXHRcdFx0YXR0cmlidXRlcyA9IGVsZW1lbnRvckZyb250ZW5kLmNvbmZpZy5lbGVtZW50cy5lZGl0U2V0dGluZ3NbIHRoaXMuZ2V0TW9kZWxDSUQoKSBdLmF0dHJpYnV0ZXM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuZ2V0SXRlbXMoIGF0dHJpYnV0ZXMsIHNldHRpbmcgKTtcblx0fVxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZXJNb2R1bGU7XG4iLCJ2YXIgVGFic01vZHVsZSA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlcnMvYmFzZS10YWJzJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUgKSB7XG5cdG5ldyBUYWJzTW9kdWxlKCB7XG5cdFx0JGVsZW1lbnQ6ICRzY29wZSxcblx0XHRzaG93VGFiRm46ICdzbGlkZURvd24nLFxuXHRcdGhpZGVUYWJGbjogJ3NsaWRlVXAnXG5cdH0gKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XG5cdCRzY29wZS5maW5kKCAnLmVsZW1lbnRvci1hbGVydC1kaXNtaXNzJyApLm9uKCAnY2xpY2snLCBmdW5jdGlvbigpIHtcblx0XHQkKCB0aGlzICkucGFyZW50KCkuZmFkZU91dCgpO1xuXHR9ICk7XG59O1xuIiwidmFyIEhhbmRsZXJNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXItbW9kdWxlJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEhhbmRsZXJNb2R1bGUuZXh0ZW5kKCB7XG5cdCRhY3RpdmVDb250ZW50OiBudWxsLFxuXG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHR0YWJUaXRsZTogJy5lbGVtZW50b3ItdGFiLXRpdGxlJyxcblx0XHRcdFx0dGFiQ29udGVudDogJy5lbGVtZW50b3ItdGFiLWNvbnRlbnQnXG5cdFx0XHR9LFxuXHRcdFx0Y2xhc3Nlczoge1xuXHRcdFx0XHRhY3RpdmU6ICdlbGVtZW50b3ItYWN0aXZlJ1xuXHRcdFx0fSxcblx0XHRcdHNob3dUYWJGbjogJ3Nob3cnLFxuXHRcdFx0aGlkZVRhYkZuOiAnaGlkZScsXG5cdFx0XHR0b2dnbGVTZWxmOiB0cnVlLFxuXHRcdFx0aGlkZVByZXZpb3VzOiB0cnVlLFxuXHRcdFx0YXV0b0V4cGFuZDogdHJ1ZVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0RGVmYXVsdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0b3JzID0gdGhpcy5nZXRTZXR0aW5ncyggJ3NlbGVjdG9ycycgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHQkdGFiVGl0bGVzOiB0aGlzLmZpbmRFbGVtZW50KCBzZWxlY3RvcnMudGFiVGl0bGUgKSxcblx0XHRcdCR0YWJDb250ZW50czogdGhpcy5maW5kRWxlbWVudCggc2VsZWN0b3JzLnRhYkNvbnRlbnQgKVxuXHRcdH07XG5cdH0sXG5cblx0YWN0aXZhdGVEZWZhdWx0VGFiOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2V0dGluZ3MgPSB0aGlzLmdldFNldHRpbmdzKCk7XG5cblx0XHRpZiAoICEgc2V0dGluZ3MuYXV0b0V4cGFuZCB8fCAnZWRpdG9yJyA9PT0gc2V0dGluZ3MuYXV0b0V4cGFuZCAmJiAhIHRoaXMuaXNFZGl0ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBkZWZhdWx0QWN0aXZlVGFiID0gdGhpcy5nZXRFZGl0U2V0dGluZ3MoICdhY3RpdmVJdGVtSW5kZXgnICkgfHwgMSxcblx0XHRcdG9yaWdpbmFsVG9nZ2xlTWV0aG9kcyA9IHtcblx0XHRcdFx0c2hvd1RhYkZuOiBzZXR0aW5ncy5zaG93VGFiRm4sXG5cdFx0XHRcdGhpZGVUYWJGbjogc2V0dGluZ3MuaGlkZVRhYkZuXG5cdFx0XHR9O1xuXG5cdFx0Ly8gVG9nZ2xlIHRhYnMgd2l0aG91dCBhbmltYXRpb24gdG8gYXZvaWQganVtcGluZ1xuXHRcdHRoaXMuc2V0U2V0dGluZ3MoIHtcblx0XHRcdHNob3dUYWJGbjogJ3Nob3cnLFxuXHRcdFx0aGlkZVRhYkZuOiAnaGlkZSdcblx0XHR9ICk7XG5cblx0XHR0aGlzLmNoYW5nZUFjdGl2ZVRhYiggZGVmYXVsdEFjdGl2ZVRhYiApO1xuXG5cdFx0Ly8gUmV0dXJuIGJhY2sgb3JpZ2luYWwgdG9nZ2xlIGVmZmVjdHNcblx0XHR0aGlzLnNldFNldHRpbmdzKCBvcmlnaW5hbFRvZ2dsZU1ldGhvZHMgKTtcblx0fSxcblxuXHRkZWFjdGl2YXRlQWN0aXZlVGFiOiBmdW5jdGlvbiggdGFiSW5kZXggKSB7XG5cdFx0dmFyIHNldHRpbmdzID0gdGhpcy5nZXRTZXR0aW5ncygpLFxuXHRcdFx0YWN0aXZlQ2xhc3MgPSBzZXR0aW5ncy5jbGFzc2VzLmFjdGl2ZSxcblx0XHRcdGFjdGl2ZUZpbHRlciA9IHRhYkluZGV4ID8gJ1tkYXRhLXRhYj1cIicgKyB0YWJJbmRleCArICdcIl0nIDogJy4nICsgYWN0aXZlQ2xhc3MsXG5cdFx0XHQkYWN0aXZlVGl0bGUgPSB0aGlzLmVsZW1lbnRzLiR0YWJUaXRsZXMuZmlsdGVyKCBhY3RpdmVGaWx0ZXIgKSxcblx0XHRcdCRhY3RpdmVDb250ZW50ID0gdGhpcy5lbGVtZW50cy4kdGFiQ29udGVudHMuZmlsdGVyKCBhY3RpdmVGaWx0ZXIgKTtcblxuXHRcdCRhY3RpdmVUaXRsZS5hZGQoICRhY3RpdmVDb250ZW50ICkucmVtb3ZlQ2xhc3MoIGFjdGl2ZUNsYXNzICk7XG5cblx0XHQkYWN0aXZlQ29udGVudFsgc2V0dGluZ3MuaGlkZVRhYkZuIF0oKTtcblx0fSxcblxuXHRhY3RpdmF0ZVRhYjogZnVuY3Rpb24oIHRhYkluZGV4ICkge1xuXHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3MoKSxcblx0XHRcdGFjdGl2ZUNsYXNzID0gc2V0dGluZ3MuY2xhc3Nlcy5hY3RpdmUsXG5cdFx0XHQkcmVxdWVzdGVkVGl0bGUgPSB0aGlzLmVsZW1lbnRzLiR0YWJUaXRsZXMuZmlsdGVyKCAnW2RhdGEtdGFiPVwiJyArIHRhYkluZGV4ICsgJ1wiXScgKSxcblx0XHRcdCRyZXF1ZXN0ZWRDb250ZW50ID0gdGhpcy5lbGVtZW50cy4kdGFiQ29udGVudHMuZmlsdGVyKCAnW2RhdGEtdGFiPVwiJyArIHRhYkluZGV4ICsgJ1wiXScgKTtcblxuXHRcdCRyZXF1ZXN0ZWRUaXRsZS5hZGQoICRyZXF1ZXN0ZWRDb250ZW50ICkuYWRkQ2xhc3MoIGFjdGl2ZUNsYXNzICk7XG5cblx0XHQkcmVxdWVzdGVkQ29udGVudFsgc2V0dGluZ3Muc2hvd1RhYkZuIF0oKTtcblx0fSxcblxuXHRpc0FjdGl2ZVRhYjogZnVuY3Rpb24oIHRhYkluZGV4ICkge1xuXHRcdHJldHVybiB0aGlzLmVsZW1lbnRzLiR0YWJUaXRsZXMuZmlsdGVyKCAnW2RhdGEtdGFiPVwiJyArIHRhYkluZGV4ICsgJ1wiXScgKS5oYXNDbGFzcyggdGhpcy5nZXRTZXR0aW5ncyggJ2NsYXNzZXMuYWN0aXZlJyApICk7XG5cdH0sXG5cblx0YmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0c2VsZi5lbGVtZW50cy4kdGFiVGl0bGVzLm9uKCAnZm9jdXMnLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRzZWxmLmNoYW5nZUFjdGl2ZVRhYiggZXZlbnQuY3VycmVudFRhcmdldC5kYXRhc2V0LnRhYiApO1xuXHRcdH0gKTtcblxuXHRcdGlmICggc2VsZi5nZXRTZXR0aW5ncyggJ3RvZ2dsZVNlbGYnICkgKSB7XG5cdFx0XHRzZWxmLmVsZW1lbnRzLiR0YWJUaXRsZXMub24oICdtb3VzZWRvd24nLCBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHRcdGlmICggalF1ZXJ5KCBldmVudC5jdXJyZW50VGFyZ2V0ICkuaXMoICc6Zm9jdXMnICkgKSB7XG5cdFx0XHRcdFx0c2VsZi5jaGFuZ2VBY3RpdmVUYWIoIGV2ZW50LmN1cnJlbnRUYXJnZXQuZGF0YXNldC50YWIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fSApO1xuXHRcdH1cblx0fSxcblxuXHRvbkluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdEhhbmRsZXJNb2R1bGUucHJvdG90eXBlLm9uSW5pdC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHR0aGlzLmFjdGl2YXRlRGVmYXVsdFRhYigpO1xuXHR9LFxuXG5cdG9uRWRpdFNldHRpbmdzQ2hhbmdlOiBmdW5jdGlvbiggcHJvcGVydHlOYW1lICkge1xuXHRcdGlmICggJ2FjdGl2ZUl0ZW1JbmRleCcgPT09IHByb3BlcnR5TmFtZSApIHtcblx0XHRcdHRoaXMuYWN0aXZhdGVEZWZhdWx0VGFiKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNoYW5nZUFjdGl2ZVRhYjogZnVuY3Rpb24oIHRhYkluZGV4ICkge1xuXHRcdHZhciBpc0FjdGl2ZVRhYiA9IHRoaXMuaXNBY3RpdmVUYWIoIHRhYkluZGV4ICksXG5cdFx0XHRzZXR0aW5ncyA9IHRoaXMuZ2V0U2V0dGluZ3MoKTtcblxuXHRcdGlmICggKCBzZXR0aW5ncy50b2dnbGVTZWxmIHx8ICEgaXNBY3RpdmVUYWIgKSAmJiBzZXR0aW5ncy5oaWRlUHJldmlvdXMgKSB7XG5cdFx0XHR0aGlzLmRlYWN0aXZhdGVBY3RpdmVUYWIoKTtcblx0XHR9XG5cblx0XHRpZiAoICEgc2V0dGluZ3MuaGlkZVByZXZpb3VzICYmIGlzQWN0aXZlVGFiICkge1xuXHRcdFx0dGhpcy5kZWFjdGl2YXRlQWN0aXZlVGFiKCB0YWJJbmRleCApO1xuXHRcdH1cblxuXHRcdGlmICggISBpc0FjdGl2ZVRhYiApIHtcblx0XHRcdHRoaXMuYWN0aXZhdGVUYWIoIHRhYkluZGV4ICk7XG5cdFx0fVxuXHR9XG59ICk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XG5cdGVsZW1lbnRvckZyb250ZW5kLndheXBvaW50KCAkc2NvcGUuZmluZCggJy5lbGVtZW50b3ItY291bnRlci1udW1iZXInICksIGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkbnVtYmVyID0gJCggdGhpcyApLFxuXHRcdFx0ZGF0YSA9ICRudW1iZXIuZGF0YSgpO1xuXG5cdFx0dmFyIGRlY2ltYWxEaWdpdHMgPSBkYXRhLnRvVmFsdWUudG9TdHJpbmcoKS5tYXRjaCggL1xcLiguKikvICk7XG5cblx0XHRpZiAoIGRlY2ltYWxEaWdpdHMgKSB7XG5cdFx0XHRkYXRhLnJvdW5kaW5nID0gZGVjaW1hbERpZ2l0c1sxXS5sZW5ndGg7XG5cdFx0fVxuXG5cdFx0JG51bWJlci5udW1lcmF0b3IoIGRhdGEgKTtcblx0fSwgeyBvZmZzZXQ6ICc5MCUnIH0gKTtcbn07XG4iLCJ2YXIgSGFuZGxlck1vZHVsZSA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlci1tb2R1bGUnICksXG5cdEdsb2JhbEhhbmRsZXI7XG5cbkdsb2JhbEhhbmRsZXIgPSBIYW5kbGVyTW9kdWxlLmV4dGVuZCgge1xuXHRnZXRFbGVtZW50TmFtZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICdnbG9iYWwnO1xuXHR9LFxuXHRhbmltYXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGVsZW1lbnQgPSB0aGlzLiRlbGVtZW50LFxuXHRcdFx0YW5pbWF0aW9uID0gdGhpcy5nZXRBbmltYXRpb24oKSxcblx0XHRcdGVsZW1lbnRTZXR0aW5ncyA9IHRoaXMuZ2V0RWxlbWVudFNldHRpbmdzKCksXG5cdFx0XHRhbmltYXRpb25EZWxheSA9IGVsZW1lbnRTZXR0aW5ncy5fYW5pbWF0aW9uX2RlbGF5IHx8IGVsZW1lbnRTZXR0aW5ncy5hbmltYXRpb25fZGVsYXkgfHwgMDtcblxuXHRcdCRlbGVtZW50LnJlbW92ZUNsYXNzKCBhbmltYXRpb24gKTtcblxuXHRcdHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0JGVsZW1lbnQucmVtb3ZlQ2xhc3MoICdlbGVtZW50b3ItaW52aXNpYmxlJyApLmFkZENsYXNzKCBhbmltYXRpb24gKTtcblx0XHR9LCBhbmltYXRpb25EZWxheSApO1xuXHR9LFxuXHRnZXRBbmltYXRpb246IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbGVtZW50U2V0dGluZ3MgPSB0aGlzLmdldEVsZW1lbnRTZXR0aW5ncygpO1xuXG5cdFx0cmV0dXJuIGVsZW1lbnRTZXR0aW5ncy5hbmltYXRpb24gfHwgZWxlbWVudFNldHRpbmdzLl9hbmltYXRpb247XG5cdH0sXG5cdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXG5cdFx0SGFuZGxlck1vZHVsZS5wcm90b3R5cGUub25Jbml0LmFwcGx5KCBzZWxmLCBhcmd1bWVudHMgKTtcblxuXHRcdGlmICggISBzZWxmLmdldEFuaW1hdGlvbigpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciB3YXlwb2ludCA9IGVsZW1lbnRvckZyb250ZW5kLndheXBvaW50KCBzZWxmLiRlbGVtZW50LCBmdW5jdGlvbigpIHtcblx0XHRcdHNlbGYuYW5pbWF0ZSgpO1xuXG5cdFx0XHRpZiAoIHdheXBvaW50ICYmIHdheXBvaW50WzBdICYmIHdheXBvaW50WzBdLmRlc3Ryb3kgKSB7IC8vIElmIGl0J3MgV2F5cG9pbnQgbmV3IEFQSSBhbmQgaXMgZnJvbnRlbmRcblx0XHRcdFx0d2F5cG9pbnRbMF0uZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH0sIHsgb2Zmc2V0OiAnOTAlJyB9ICk7XG5cdH0sXG5cdG9uRWxlbWVudENoYW5nZTogZnVuY3Rpb24oIHByb3BlcnR5TmFtZSApIHtcblx0XHRpZiAoIC9eXz9hbmltYXRpb24vLnRlc3QoIHByb3BlcnR5TmFtZSApICkge1xuXHRcdFx0dGhpcy5hbmltYXRlKCk7XG5cdFx0fVxuXHR9XG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSApIHtcblx0bmV3IEdsb2JhbEhhbmRsZXIoIHsgJGVsZW1lbnQ6ICRzY29wZSB9ICk7XG59O1xuIiwidmFyIEhhbmRsZXJNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXItbW9kdWxlJyApLFxuXHRJbWFnZUNhcm91c2VsSGFuZGxlcjtcblxuSW1hZ2VDYXJvdXNlbEhhbmRsZXIgPSBIYW5kbGVyTW9kdWxlLmV4dGVuZCgge1xuXHRnZXREZWZhdWx0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzZWxlY3RvcnM6IHtcblx0XHRcdFx0Y2Fyb3VzZWw6ICcuZWxlbWVudG9yLWltYWdlLWNhcm91c2VsJ1xuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0RGVmYXVsdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0b3JzID0gdGhpcy5nZXRTZXR0aW5ncyggJ3NlbGVjdG9ycycgKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHQkY2Fyb3VzZWw6IHRoaXMuJGVsZW1lbnQuZmluZCggc2VsZWN0b3JzLmNhcm91c2VsIClcblx0XHR9O1xuXHR9LFxuXG5cdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0SGFuZGxlck1vZHVsZS5wcm90b3R5cGUub25Jbml0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdHZhciBlbGVtZW50U2V0dGluZ3MgPSB0aGlzLmdldEVsZW1lbnRTZXR0aW5ncygpLFxuXHRcdFx0c2xpZGVzVG9TaG93ID0gK2VsZW1lbnRTZXR0aW5ncy5zbGlkZXNfdG9fc2hvdyB8fCAzLFxuXHRcdFx0aXNTaW5nbGVTbGlkZSA9IDEgPT09IHNsaWRlc1RvU2hvdztcblxuXHRcdHZhciBzbGlja09wdGlvbnMgPSB7XG5cdFx0XHRzbGlkZXNUb1Nob3c6IHNsaWRlc1RvU2hvdyxcblx0XHRcdGF1dG9wbGF5OiAneWVzJyA9PT0gZWxlbWVudFNldHRpbmdzLmF1dG9wbGF5LFxuXHRcdFx0YXV0b3BsYXlTcGVlZDogZWxlbWVudFNldHRpbmdzLmF1dG9wbGF5X3NwZWVkLFxuXHRcdFx0aW5maW5pdGU6ICd5ZXMnID09PSBlbGVtZW50U2V0dGluZ3MuaW5maW5pdGUsXG5cdFx0XHRwYXVzZU9uSG92ZXI6ICd5ZXMnID09PSAgZWxlbWVudFNldHRpbmdzLnBhdXNlX29uX2hvdmVyLFxuXHRcdFx0c3BlZWQ6IGVsZW1lbnRTZXR0aW5ncy5zcGVlZCxcblx0XHRcdGFycm93czogLTEgIT09IFsgJ2Fycm93cycsICdib3RoJyBdLmluZGV4T2YoIGVsZW1lbnRTZXR0aW5ncy5uYXZpZ2F0aW9uICksXG5cdFx0XHRkb3RzOiAtMSAhPT0gWyAnZG90cycsICdib3RoJyBdLmluZGV4T2YoIGVsZW1lbnRTZXR0aW5ncy5uYXZpZ2F0aW9uICksXG5cdFx0XHRydGw6ICdydGwnID09PSBlbGVtZW50U2V0dGluZ3MuZGlyZWN0aW9uLFxuXHRcdFx0cmVzcG9uc2l2ZTogW1xuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YnJlYWtwb2ludDogMTAyNSxcblx0XHRcdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHRcdFx0c2xpZGVzVG9TaG93OiArZWxlbWVudFNldHRpbmdzLnNsaWRlc190b19zaG93X3RhYmxldCB8fCAoIGlzU2luZ2xlU2xpZGUgPyAxIDogMiApLFxuXHRcdFx0XHRcdFx0c2xpZGVzVG9TY3JvbGw6IDFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRicmVha3BvaW50OiA3NjgsXG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2hvdzogK2VsZW1lbnRTZXR0aW5ncy5zbGlkZXNfdG9fc2hvd19tb2JpbGUgfHwgMSxcblx0XHRcdFx0XHRcdHNsaWRlc1RvU2Nyb2xsOiAxXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblxuXHRcdGlmICggaXNTaW5nbGVTbGlkZSApIHtcblx0XHRcdHNsaWNrT3B0aW9ucy5mYWRlID0gJ2ZhZGUnID09PSBlbGVtZW50U2V0dGluZ3MuZWZmZWN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzbGlja09wdGlvbnMuc2xpZGVzVG9TY3JvbGwgPSArZWxlbWVudFNldHRpbmdzLnNsaWRlc190b19zY3JvbGw7XG5cdFx0fVxuXG5cdFx0dGhpcy5lbGVtZW50cy4kY2Fyb3VzZWwuc2xpY2soIHNsaWNrT3B0aW9ucyApO1xuXHR9XG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSApIHtcblx0bmV3IEltYWdlQ2Fyb3VzZWxIYW5kbGVyKCB7ICRlbGVtZW50OiAkc2NvcGUgfSApO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSwgJCApIHtcblx0ZWxlbWVudG9yRnJvbnRlbmQud2F5cG9pbnQoICRzY29wZS5maW5kKCAnLmVsZW1lbnRvci1wcm9ncmVzcy1iYXInICksIGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkcHJvZ3Jlc3NiYXIgPSAkKCB0aGlzICk7XG5cblx0XHQkcHJvZ3Jlc3NiYXIuY3NzKCAnd2lkdGgnLCAkcHJvZ3Jlc3NiYXIuZGF0YSggJ21heCcgKSArICclJyApO1xuXHR9LCB7IG9mZnNldDogJzkwJScgfSApO1xufTtcbiIsInZhciBIYW5kbGVyTW9kdWxlID0gcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVyLW1vZHVsZScgKTtcblxudmFyIEJhY2tncm91bmRWaWRlbyA9IEhhbmRsZXJNb2R1bGUuZXh0ZW5kKCB7XG5cdHBsYXllcjogbnVsbCxcblxuXHRpc1lUVmlkZW86IG51bGwsXG5cblx0Z2V0RGVmYXVsdFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VsZWN0b3JzOiB7XG5cdFx0XHRcdGJhY2tncm91bmRWaWRlb0NvbnRhaW5lcjogJy5lbGVtZW50b3ItYmFja2dyb3VuZC12aWRlby1jb250YWluZXInLFxuXHRcdFx0XHRiYWNrZ3JvdW5kVmlkZW9FbWJlZDogJy5lbGVtZW50b3ItYmFja2dyb3VuZC12aWRlby1lbWJlZCcsXG5cdFx0XHRcdGJhY2tncm91bmRWaWRlb0hvc3RlZDogJy5lbGVtZW50b3ItYmFja2dyb3VuZC12aWRlby1ob3N0ZWQnXG5cdFx0XHR9XG5cdFx0fTtcblx0fSxcblxuXHRnZXREZWZhdWx0RWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3RvcnMgPSB0aGlzLmdldFNldHRpbmdzKCAnc2VsZWN0b3JzJyApLFxuXHRcdFx0ZWxlbWVudHMgPSB7XG5cdFx0XHRcdCRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXI6IHRoaXMuJGVsZW1lbnQuZmluZCggc2VsZWN0b3JzLmJhY2tncm91bmRWaWRlb0NvbnRhaW5lciApXG5cdFx0XHR9O1xuXG5cdFx0ZWxlbWVudHMuJGJhY2tncm91bmRWaWRlb0VtYmVkID0gZWxlbWVudHMuJGJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5jaGlsZHJlbiggc2VsZWN0b3JzLmJhY2tncm91bmRWaWRlb0VtYmVkICk7XG5cblx0XHRlbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvSG9zdGVkID0gZWxlbWVudHMuJGJhY2tncm91bmRWaWRlb0NvbnRhaW5lci5jaGlsZHJlbiggc2VsZWN0b3JzLmJhY2tncm91bmRWaWRlb0hvc3RlZCApO1xuXG5cdFx0cmV0dXJuIGVsZW1lbnRzO1xuXHR9LFxuXG5cdGNhbGNWaWRlb3NTaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29udGFpbmVyV2lkdGggPSB0aGlzLmVsZW1lbnRzLiRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXIub3V0ZXJXaWR0aCgpLFxuXHRcdFx0Y29udGFpbmVySGVpZ2h0ID0gdGhpcy5lbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLm91dGVySGVpZ2h0KCksXG5cdFx0XHRhc3BlY3RSYXRpb1NldHRpbmcgPSAnMTY6OScsIC8vVEVNUFxuXHRcdFx0YXNwZWN0UmF0aW9BcnJheSA9IGFzcGVjdFJhdGlvU2V0dGluZy5zcGxpdCggJzonICksXG5cdFx0XHRhc3BlY3RSYXRpbyA9IGFzcGVjdFJhdGlvQXJyYXlbIDAgXSAvIGFzcGVjdFJhdGlvQXJyYXlbIDEgXSxcblx0XHRcdHJhdGlvV2lkdGggPSBjb250YWluZXJXaWR0aCAvIGFzcGVjdFJhdGlvLFxuXHRcdFx0cmF0aW9IZWlnaHQgPSBjb250YWluZXJIZWlnaHQgKiBhc3BlY3RSYXRpbyxcblx0XHRcdGlzV2lkdGhGaXhlZCA9IGNvbnRhaW5lcldpZHRoIC8gY29udGFpbmVySGVpZ2h0ID4gYXNwZWN0UmF0aW87XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0d2lkdGg6IGlzV2lkdGhGaXhlZCA/IGNvbnRhaW5lcldpZHRoIDogcmF0aW9IZWlnaHQsXG5cdFx0XHRoZWlnaHQ6IGlzV2lkdGhGaXhlZCA/IHJhdGlvV2lkdGggOiBjb250YWluZXJIZWlnaHRcblx0XHR9O1xuXHR9LFxuXG5cdGNoYW5nZVZpZGVvU2l6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICR2aWRlbyA9IHRoaXMuaXNZVFZpZGVvID8galF1ZXJ5KCB0aGlzLnBsYXllci5nZXRJZnJhbWUoKSApIDogdGhpcy5lbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvSG9zdGVkLFxuXHRcdFx0c2l6ZSA9IHRoaXMuY2FsY1ZpZGVvc1NpemUoKTtcblxuXHRcdCR2aWRlby53aWR0aCggc2l6ZS53aWR0aCApLmhlaWdodCggc2l6ZS5oZWlnaHQgKTtcblx0fSxcblxuXHRwcmVwYXJlWVRWaWRlbzogZnVuY3Rpb24oIFlULCB2aWRlb0lEICkge1xuXHRcdHZhciBzZWxmID0gdGhpcyxcblx0XHRcdCRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXIgPSBzZWxmLmVsZW1lbnRzLiRiYWNrZ3JvdW5kVmlkZW9Db250YWluZXI7XG5cblx0XHQkYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLmFkZENsYXNzKCAnZWxlbWVudG9yLWxvYWRpbmcgZWxlbWVudG9yLWludmlzaWJsZScgKTtcblxuXHRcdHNlbGYucGxheWVyID0gbmV3IFlULlBsYXllciggc2VsZi5lbGVtZW50cy4kYmFja2dyb3VuZFZpZGVvRW1iZWRbIDAgXSwge1xuXHRcdFx0dmlkZW9JZDogdmlkZW9JRCxcblx0XHRcdGV2ZW50czoge1xuXHRcdFx0XHRvblJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzZWxmLnBsYXllci5tdXRlKCk7XG5cblx0XHRcdFx0XHRzZWxmLmNoYW5nZVZpZGVvU2l6ZSgpO1xuXG5cdFx0XHRcdFx0c2VsZi5wbGF5ZXIucGxheVZpZGVvKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9uU3RhdGVDaGFuZ2U6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRzd2l0Y2ggKCBldmVudC5kYXRhICkge1xuXHRcdFx0XHRcdFx0Y2FzZSBZVC5QbGF5ZXJTdGF0ZS5QTEFZSU5HOlxuXHRcdFx0XHRcdFx0XHQkYmFja2dyb3VuZFZpZGVvQ29udGFpbmVyLnJlbW92ZUNsYXNzKCAnZWxlbWVudG9yLWludmlzaWJsZSBlbGVtZW50b3ItbG9hZGluZycgKTtcblxuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgWVQuUGxheWVyU3RhdGUuRU5ERUQ6XG5cdFx0XHRcdFx0XHRcdHNlbGYucGxheWVyLnNlZWtUbyggMCApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHBsYXllclZhcnM6IHtcblx0XHRcdFx0Y29udHJvbHM6IDAsXG5cdFx0XHRcdHNob3dpbmZvOiAwLFxuXHRcdFx0XHRyZWw6IDBcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRlbGVtZW50b3JGcm9udGVuZC5nZXRFbGVtZW50cyggJyR3aW5kb3cnICkub24oICdyZXNpemUnLCBzZWxmLmNoYW5nZVZpZGVvU2l6ZSApO1xuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHR2aWRlb0xpbmsgPSBzZWxmLmdldEVsZW1lbnRTZXR0aW5ncyggJ2JhY2tncm91bmRfdmlkZW9fbGluaycgKSxcblx0XHRcdHZpZGVvSUQgPSBlbGVtZW50b3JGcm9udGVuZC51dGlscy55b3V0dWJlLmdldFlvdXR1YmVJREZyb21VUkwoIHZpZGVvTGluayApO1xuXG5cdFx0c2VsZi5pc1lUVmlkZW8gPSAhISB2aWRlb0lEO1xuXG5cdFx0aWYgKCB2aWRlb0lEICkge1xuXHRcdFx0ZWxlbWVudG9yRnJvbnRlbmQudXRpbHMueW91dHViZS5vbllvdXR1YmVBcGlSZWFkeSggZnVuY3Rpb24oIFlUICkge1xuXHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzZWxmLnByZXBhcmVZVFZpZGVvKCBZVCwgdmlkZW9JRCApO1xuXHRcdFx0XHR9LCAxICk7XG5cdFx0XHR9ICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGYuZWxlbWVudHMuJGJhY2tncm91bmRWaWRlb0hvc3RlZC5hdHRyKCAnc3JjJywgdmlkZW9MaW5rICkub25lKCAnY2FucGxheScsIHNlbGYuY2hhbmdlVmlkZW9TaXplICk7XG5cdFx0fVxuXHR9LFxuXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5pc1lUVmlkZW8gJiYgdGhpcy5wbGF5ZXIuZ2V0SWZyYW1lKCkgKSB7XG5cdFx0XHR0aGlzLnBsYXllci5kZXN0cm95KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZWxlbWVudHMuJGJhY2tncm91bmRWaWRlb0hvc3RlZC5yZW1vdmVBdHRyKCAnc3JjJyApO1xuXHRcdH1cblx0fSxcblxuXHRydW46IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBlbGVtZW50U2V0dGluZ3MgPSB0aGlzLmdldEVsZW1lbnRTZXR0aW5ncygpO1xuXG5cdFx0aWYgKCAndmlkZW8nID09PSBlbGVtZW50U2V0dGluZ3MuYmFja2dyb3VuZF9iYWNrZ3JvdW5kICYmIGVsZW1lbnRTZXR0aW5ncy5iYWNrZ3JvdW5kX3ZpZGVvX2xpbmsgKSB7XG5cdFx0XHR0aGlzLmFjdGl2YXRlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuZGVhY3RpdmF0ZSgpO1xuXHRcdH1cblx0fSxcblxuXHRvbkluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdEhhbmRsZXJNb2R1bGUucHJvdG90eXBlLm9uSW5pdC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHR0aGlzLnJ1bigpO1xuXHR9LFxuXG5cdG9uRWxlbWVudENoYW5nZTogZnVuY3Rpb24oIHByb3BlcnR5TmFtZSApIHtcblx0XHRpZiAoICdiYWNrZ3JvdW5kX2JhY2tncm91bmQnID09PSBwcm9wZXJ0eU5hbWUgKSB7XG5cdFx0XHR0aGlzLnJ1bigpO1xuXHRcdH1cblx0fVxufSApO1xuXG52YXIgU3RyZXRjaGVkU2VjdGlvbiA9IEhhbmRsZXJNb2R1bGUuZXh0ZW5kKCB7XG5cblx0c3RyZXRjaEVsZW1lbnQ6IG51bGwsXG5cblx0YmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQuYWRkTGlzdGVuZXJPbmNlKCB0aGlzLiRlbGVtZW50LmRhdGEoICdtb2RlbC1jaWQnICksICdyZXNpemUnLCB0aGlzLnN0cmV0Y2hTZWN0aW9uICk7XG5cdH0sXG5cblx0aW5pdFN0cmV0Y2g6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3RyZXRjaEVsZW1lbnQgPSBuZXcgZWxlbWVudG9yRnJvbnRlbmQubW9kdWxlcy5TdHJldGNoRWxlbWVudCggeyBlbGVtZW50OiB0aGlzLiRlbGVtZW50IH0gKTtcblx0fSxcblxuXHRzdHJldGNoU2VjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGlzU3RyZXRjaGVkID0gdGhpcy4kZWxlbWVudC5oYXNDbGFzcyggJ2VsZW1lbnRvci1zZWN0aW9uLXN0cmV0Y2hlZCcgKTtcblxuXHRcdGlmICggZWxlbWVudG9yRnJvbnRlbmQuaXNFZGl0TW9kZSgpIHx8IGlzU3RyZXRjaGVkICkge1xuXHRcdFx0dGhpcy5zdHJldGNoRWxlbWVudC5yZXNldCgpO1xuXHRcdH1cblxuXHRcdGlmICggaXNTdHJldGNoZWQgKSB7XG5cdFx0XHR0aGlzLnN0cmV0Y2hFbGVtZW50LnNldFNldHRpbmdzKCAnc2VsZWN0b3JzLmNvbnRhaW5lcicsIGVsZW1lbnRvckZyb250ZW5kLmdldEdlbmVyYWxTZXR0aW5ncyggJ2VsZW1lbnRvcl9zdHJldGNoZWRfc2VjdGlvbl9jb250YWluZXInICkgfHwgd2luZG93ICk7XG5cblx0XHRcdHRoaXMuc3RyZXRjaEVsZW1lbnQuc3RyZXRjaCgpO1xuXHRcdH1cblx0fSxcblxuXHRvbkluaXQ6IGZ1bmN0aW9uKCkge1xuXHRcdEhhbmRsZXJNb2R1bGUucHJvdG90eXBlLm9uSW5pdC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHR0aGlzLmluaXRTdHJldGNoKCk7XG5cblx0XHR0aGlzLnN0cmV0Y2hTZWN0aW9uKCk7XG5cdH0sXG5cblx0b25HZW5lcmFsU2V0dGluZ3NDaGFuZ2U6IGZ1bmN0aW9uKCBjaGFuZ2VkICkge1xuXHRcdGlmICggJ2VsZW1lbnRvcl9zdHJldGNoZWRfc2VjdGlvbl9jb250YWluZXInIGluIGNoYW5nZWQgKSB7XG5cdFx0XHR0aGlzLnN0cmV0Y2hTZWN0aW9uKCk7XG5cdFx0fVxuXHR9XG59ICk7XG5cbnZhciBTaGFwZXMgPSBIYW5kbGVyTW9kdWxlLmV4dGVuZCgge1xuXG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRjb250YWluZXI6ICc+IC5lbGVtZW50b3Itc2hhcGUtJXMnXG5cdFx0XHR9LFxuXHRcdFx0c3ZnVVJMOiBlbGVtZW50b3JGcm9udGVuZC5jb25maWcudXJscy5hc3NldHMgKyAnc2hhcGVzLydcblx0XHR9O1xuXHR9LFxuXG5cdGdldERlZmF1bHRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVsZW1lbnRzID0ge30sXG5cdFx0XHRzZWxlY3RvcnMgPSB0aGlzLmdldFNldHRpbmdzKCAnc2VsZWN0b3JzJyApO1xuXG5cdFx0ZWxlbWVudHMuJHRvcENvbnRhaW5lciA9IHRoaXMuJGVsZW1lbnQuZmluZCggc2VsZWN0b3JzLmNvbnRhaW5lci5yZXBsYWNlKCAnJXMnLCAndG9wJyApICk7XG5cblx0XHRlbGVtZW50cy4kYm90dG9tQ29udGFpbmVyID0gdGhpcy4kZWxlbWVudC5maW5kKCBzZWxlY3RvcnMuY29udGFpbmVyLnJlcGxhY2UoICclcycsICdib3R0b20nICkgKTtcblxuXHRcdHJldHVybiBlbGVtZW50cztcblx0fSxcblxuXHRidWlsZFNWRzogZnVuY3Rpb24oIHNpZGUgKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0YmFzZVNldHRpbmdLZXkgPSAnc2hhcGVfZGl2aWRlcl8nICsgc2lkZSxcblx0XHRcdHNoYXBlVHlwZSA9IHNlbGYuZ2V0RWxlbWVudFNldHRpbmdzKCBiYXNlU2V0dGluZ0tleSApLFxuXHRcdFx0JHN2Z0NvbnRhaW5lciA9IHRoaXMuZWxlbWVudHNbICckJyArIHNpZGUgKyAnQ29udGFpbmVyJyBdO1xuXG5cdFx0JHN2Z0NvbnRhaW5lci5lbXB0eSgpLmF0dHIoICdkYXRhLXNoYXBlJywgc2hhcGVUeXBlICk7XG5cblx0XHRpZiAoICEgc2hhcGVUeXBlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBmaWxlTmFtZSA9IHNoYXBlVHlwZTtcblxuXHRcdGlmICggc2VsZi5nZXRFbGVtZW50U2V0dGluZ3MoIGJhc2VTZXR0aW5nS2V5ICsgJ19uZWdhdGl2ZScgKSApIHtcblx0XHRcdGZpbGVOYW1lICs9ICctbmVnYXRpdmUnO1xuXHRcdH1cblxuXHRcdHZhciBzdmdVUkwgPSBzZWxmLmdldFNldHRpbmdzKCAnc3ZnVVJMJyApICsgZmlsZU5hbWUgKyAnLnN2Zyc7XG5cblx0XHRqUXVlcnkuZ2V0KCBzdmdVUkwsIGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFx0JHN2Z0NvbnRhaW5lci5hcHBlbmQoIGRhdGEuY2hpbGROb2Rlc1swXSApO1xuXHRcdH0gKTtcblxuXHRcdHRoaXMuc2V0TmVnYXRpdmUoIHNpZGUgKTtcblx0fSxcblxuXHRzZXROZWdhdGl2ZTogZnVuY3Rpb24oIHNpZGUgKSB7XG5cdFx0dGhpcy5lbGVtZW50c1sgJyQnICsgc2lkZSArICdDb250YWluZXInIF0uYXR0ciggJ2RhdGEtbmVnYXRpdmUnLCAhISB0aGlzLmdldEVsZW1lbnRTZXR0aW5ncyggJ3NoYXBlX2RpdmlkZXJfJyArIHNpZGUgKyAnX25lZ2F0aXZlJyApICk7XG5cdH0sXG5cblx0b25Jbml0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHRIYW5kbGVyTW9kdWxlLnByb3RvdHlwZS5vbkluaXQuYXBwbHkoIHNlbGYsIGFyZ3VtZW50cyApO1xuXG5cdFx0WyAndG9wJywgJ2JvdHRvbScgXS5mb3JFYWNoKCBmdW5jdGlvbiggc2lkZSApIHtcblx0XHRcdGlmICggc2VsZi5nZXRFbGVtZW50U2V0dGluZ3MoICdzaGFwZV9kaXZpZGVyXycgKyBzaWRlICkgKSB7XG5cdFx0XHRcdHNlbGYuYnVpbGRTVkcoIHNpZGUgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH0sXG5cblx0b25FbGVtZW50Q2hhbmdlOiBmdW5jdGlvbiggcHJvcGVydHlOYW1lICkge1xuXHRcdHZhciBzaGFwZUNoYW5nZSA9IHByb3BlcnR5TmFtZS5tYXRjaCggL15zaGFwZV9kaXZpZGVyXyh0b3B8Ym90dG9tKSQvICk7XG5cblx0XHRpZiAoIHNoYXBlQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5idWlsZFNWRyggc2hhcGVDaGFuZ2VbMV0gKTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBuZWdhdGl2ZUNoYW5nZSA9IHByb3BlcnR5TmFtZS5tYXRjaCggL15zaGFwZV9kaXZpZGVyXyh0b3B8Ym90dG9tKV9uZWdhdGl2ZSQvICk7XG5cblx0XHRpZiAoIG5lZ2F0aXZlQ2hhbmdlICkge1xuXHRcdFx0dGhpcy5idWlsZFNWRyggbmVnYXRpdmVDaGFuZ2VbMV0gKTtcblxuXHRcdFx0dGhpcy5zZXROZWdhdGl2ZSggbmVnYXRpdmVDaGFuZ2VbMV0gKTtcblx0XHR9XG5cdH1cbn0gKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJHNjb3BlICkge1xuXHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSB8fCAkc2NvcGUuaGFzQ2xhc3MoICdlbGVtZW50b3Itc2VjdGlvbi1zdHJldGNoZWQnICkgKSB7XG5cdFx0bmV3IFN0cmV0Y2hlZFNlY3Rpb24oIHsgJGVsZW1lbnQ6ICRzY29wZSB9ICk7XG5cdH1cblxuXHRpZiAoIGVsZW1lbnRvckZyb250ZW5kLmlzRWRpdE1vZGUoKSApIHtcblx0XHRuZXcgU2hhcGVzKCB7ICRlbGVtZW50OiAgJHNjb3BlIH0gKTtcblx0fVxuXG5cdG5ldyBCYWNrZ3JvdW5kVmlkZW8oIHsgJGVsZW1lbnQ6ICRzY29wZSB9ICk7XG59O1xuIiwidmFyIFRhYnNNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2Jhc2UtdGFicycgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJHNjb3BlICkge1xuXHRuZXcgVGFic01vZHVsZSgge1xuXHRcdCRlbGVtZW50OiAkc2NvcGUsXG5cdFx0dG9nZ2xlU2VsZjogZmFsc2Vcblx0fSApO1xufTtcbiIsInZhciBIYW5kbGVyTW9kdWxlID0gcmVxdWlyZSggJ2VsZW1lbnRvci1mcm9udGVuZC9oYW5kbGVyLW1vZHVsZScgKSxcblx0VGV4dEVkaXRvcjtcblxuVGV4dEVkaXRvciA9IEhhbmRsZXJNb2R1bGUuZXh0ZW5kKCB7XG5cdGRyb3BDYXBMZXR0ZXI6ICcnLFxuXG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRwYXJhZ3JhcGg6ICdwOmZpcnN0J1xuXHRcdFx0fSxcblx0XHRcdGNsYXNzZXM6IHtcblx0XHRcdFx0ZHJvcENhcDogJ2VsZW1lbnRvci1kcm9wLWNhcCcsXG5cdFx0XHRcdGRyb3BDYXBMZXR0ZXI6ICdlbGVtZW50b3ItZHJvcC1jYXAtbGV0dGVyJ1xuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0RGVmYXVsdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0b3JzID0gdGhpcy5nZXRTZXR0aW5ncyggJ3NlbGVjdG9ycycgKSxcblx0XHRcdGNsYXNzZXMgPSB0aGlzLmdldFNldHRpbmdzKCAnY2xhc3NlcycgKSxcblx0XHRcdCRkcm9wQ2FwID0galF1ZXJ5KCAnPHNwYW4+JywgeyAnY2xhc3MnOiBjbGFzc2VzLmRyb3BDYXAgfSApLFxuXHRcdFx0JGRyb3BDYXBMZXR0ZXIgPSBqUXVlcnkoICc8c3Bhbj4nLCB7ICdjbGFzcyc6IGNsYXNzZXMuZHJvcENhcExldHRlciB9ICk7XG5cblx0XHQkZHJvcENhcC5hcHBlbmQoICRkcm9wQ2FwTGV0dGVyICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0JHBhcmFncmFwaDogdGhpcy4kZWxlbWVudC5maW5kKCBzZWxlY3RvcnMucGFyYWdyYXBoICksXG5cdFx0XHQkZHJvcENhcDogJGRyb3BDYXAsXG5cdFx0XHQkZHJvcENhcExldHRlcjogJGRyb3BDYXBMZXR0ZXJcblx0XHR9O1xuXHR9LFxuXG5cdGdldEVsZW1lbnROYW1lOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gJ3RleHQtZWRpdG9yJztcblx0fSxcblxuXHR3cmFwRHJvcENhcDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGlzRHJvcENhcEVuYWJsZWQgPSB0aGlzLmdldEVsZW1lbnRTZXR0aW5ncyggJ2Ryb3BfY2FwJyApO1xuXG5cdFx0aWYgKCAhIGlzRHJvcENhcEVuYWJsZWQgKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBhbiBvbGQgZHJvcCBjYXAgaW5zaWRlIHRoZSBwYXJhZ3JhcGhcblx0XHRcdGlmICggdGhpcy5kcm9wQ2FwTGV0dGVyICkge1xuXHRcdFx0XHR0aGlzLmVsZW1lbnRzLiRkcm9wQ2FwLnJlbW92ZSgpO1xuXG5cdFx0XHRcdHRoaXMuZWxlbWVudHMuJHBhcmFncmFwaC5wcmVwZW5kKCB0aGlzLmRyb3BDYXBMZXR0ZXIgKTtcblxuXHRcdFx0XHR0aGlzLmRyb3BDYXBMZXR0ZXIgPSAnJztcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciAkcGFyYWdyYXBoID0gdGhpcy5lbGVtZW50cy4kcGFyYWdyYXBoO1xuXG5cdFx0aWYgKCAhICRwYXJhZ3JhcGgubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhclx0cGFyYWdyYXBoQ29udGVudCA9ICRwYXJhZ3JhcGguaHRtbCgpLnJlcGxhY2UoIC8mbmJzcDsvZywgJyAnICksXG5cdFx0XHRmaXJzdExldHRlck1hdGNoID0gcGFyYWdyYXBoQ29udGVudC5tYXRjaCggL14gKihbXiBdID8pLyApO1xuXG5cdFx0aWYgKCAhIGZpcnN0TGV0dGVyTWF0Y2ggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIGZpcnN0TGV0dGVyID0gZmlyc3RMZXR0ZXJNYXRjaFsxXSxcblx0XHRcdHRyaW1tZWRGaXJzdExldHRlciA9IGZpcnN0TGV0dGVyLnRyaW0oKTtcblxuXHRcdC8vIERvbid0IGFwcGx5IGRyb3AgY2FwIHdoZW4gdGhlIGNvbnRlbnQgc3RhcnRpbmcgd2l0aCBhbiBIVE1MIHRhZ1xuXHRcdGlmICggJzwnID09PSB0cmltbWVkRmlyc3RMZXR0ZXIgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5kcm9wQ2FwTGV0dGVyID0gZmlyc3RMZXR0ZXI7XG5cblx0XHR0aGlzLmVsZW1lbnRzLiRkcm9wQ2FwTGV0dGVyLnRleHQoIHRyaW1tZWRGaXJzdExldHRlciApO1xuXG5cdFx0dmFyIHJlc3RvcmVkUGFyYWdyYXBoQ29udGVudCA9IHBhcmFncmFwaENvbnRlbnQuc2xpY2UoIGZpcnN0TGV0dGVyLmxlbmd0aCApLnJlcGxhY2UoIC9eICovLCBmdW5jdGlvbiggbWF0Y2ggKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEFycmF5KCBtYXRjaC5sZW5ndGggKyAxICkuam9pbiggJyZuYnNwOycgKTtcblx0XHR9KTtcblxuXHRcdCRwYXJhZ3JhcGguaHRtbCggcmVzdG9yZWRQYXJhZ3JhcGhDb250ZW50ICkucHJlcGVuZCggdGhpcy5lbGVtZW50cy4kZHJvcENhcCApO1xuXHR9LFxuXG5cdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0SGFuZGxlck1vZHVsZS5wcm90b3R5cGUub25Jbml0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdHRoaXMud3JhcERyb3BDYXAoKTtcblx0fSxcblxuXHRvbkVsZW1lbnRDaGFuZ2U6IGZ1bmN0aW9uKCBwcm9wZXJ0eU5hbWUgKSB7XG5cdFx0aWYgKCAnZHJvcF9jYXAnID09PSBwcm9wZXJ0eU5hbWUgKSB7XG5cdFx0XHR0aGlzLndyYXBEcm9wQ2FwKCk7XG5cdFx0fVxuXHR9XG59ICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oICRzY29wZSApIHtcblx0bmV3IFRleHRFZGl0b3IoIHsgJGVsZW1lbnQ6ICRzY29wZSB9ICk7XG59O1xuIiwidmFyIFRhYnNNb2R1bGUgPSByZXF1aXJlKCAnZWxlbWVudG9yLWZyb250ZW5kL2hhbmRsZXJzL2Jhc2UtdGFicycgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggJHNjb3BlICkge1xuXHRuZXcgVGFic01vZHVsZSgge1xuXHRcdCRlbGVtZW50OiAkc2NvcGUsXG5cdFx0c2hvd1RhYkZuOiAnc2xpZGVEb3duJyxcblx0XHRoaWRlVGFiRm46ICdzbGlkZVVwJyxcblx0XHRoaWRlUHJldmlvdXM6IGZhbHNlLFxuXHRcdGF1dG9FeHBhbmQ6ICdlZGl0b3InXG5cdH0gKTtcbn07XG4iLCJ2YXIgSGFuZGxlck1vZHVsZSA9IHJlcXVpcmUoICdlbGVtZW50b3ItZnJvbnRlbmQvaGFuZGxlci1tb2R1bGUnICksXG5cdFZpZGVvTW9kdWxlO1xuXG5WaWRlb01vZHVsZSA9IEhhbmRsZXJNb2R1bGUuZXh0ZW5kKCB7XG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRpbWFnZU92ZXJsYXk6ICcuZWxlbWVudG9yLWN1c3RvbS1lbWJlZC1pbWFnZS1vdmVybGF5Jyxcblx0XHRcdFx0dmlkZW9XcmFwcGVyOiAnLmVsZW1lbnRvci13cmFwcGVyJyxcblx0XHRcdFx0dmlkZW9GcmFtZTogJ2lmcmFtZSdcblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdGdldERlZmF1bHRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdG9ycyA9IHRoaXMuZ2V0U2V0dGluZ3MoICdzZWxlY3RvcnMnICk7XG5cblx0XHR2YXIgZWxlbWVudHMgPSB7XG5cdFx0XHQkaW1hZ2VPdmVybGF5OiB0aGlzLiRlbGVtZW50LmZpbmQoIHNlbGVjdG9ycy5pbWFnZU92ZXJsYXkgKSxcblx0XHRcdCR2aWRlb1dyYXBwZXI6IHRoaXMuJGVsZW1lbnQuZmluZCggc2VsZWN0b3JzLnZpZGVvV3JhcHBlciApXG5cdFx0fTtcblxuXHRcdGVsZW1lbnRzLiR2aWRlb0ZyYW1lID0gZWxlbWVudHMuJHZpZGVvV3JhcHBlci5maW5kKCBzZWxlY3RvcnMudmlkZW9GcmFtZSApO1xuXG5cdFx0cmV0dXJuIGVsZW1lbnRzO1xuXHR9LFxuXG5cdGdldExpZ2h0Qm94OiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gZWxlbWVudG9yRnJvbnRlbmQudXRpbHMubGlnaHRib3g7XG5cdH0sXG5cblx0aGFuZGxlVmlkZW86IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmdldEVsZW1lbnRTZXR0aW5ncyggJ2xpZ2h0Ym94JyApICkge1xuXHRcdFx0dGhpcy5lbGVtZW50cy4kaW1hZ2VPdmVybGF5LnJlbW92ZSgpO1xuXG5cdFx0XHR0aGlzLnBsYXlWaWRlbygpO1xuXHRcdH1cblx0fSxcblxuXHRwbGF5VmlkZW86IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkdmlkZW9GcmFtZSA9IHRoaXMuZWxlbWVudHMuJHZpZGVvRnJhbWUsXG5cdFx0XHRuZXdTb3VyY2VVcmwgPSAkdmlkZW9GcmFtZVswXS5zcmMucmVwbGFjZSggJyZhdXRvcGxheT0wJywgJycgKTtcblxuXHRcdCR2aWRlb0ZyYW1lWzBdLnNyYyA9IG5ld1NvdXJjZVVybCArICcmYXV0b3BsYXk9MSc7XG5cdH0sXG5cblx0YW5pbWF0ZVZpZGVvOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdldExpZ2h0Qm94KCkuc2V0RW50cmFuY2VBbmltYXRpb24oIHRoaXMuZ2V0RWxlbWVudFNldHRpbmdzKCAnbGlnaHRib3hfY29udGVudF9hbmltYXRpb24nICkgKTtcblx0fSxcblxuXHRoYW5kbGVBc3BlY3RSYXRpbzogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXRMaWdodEJveCgpLnNldFZpZGVvQXNwZWN0UmF0aW8oIHRoaXMuZ2V0RWxlbWVudFNldHRpbmdzKCAnYXNwZWN0X3JhdGlvJyApICk7XG5cdH0sXG5cblx0YmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lbGVtZW50cy4kaW1hZ2VPdmVybGF5Lm9uKCAnY2xpY2snLCB0aGlzLmhhbmRsZVZpZGVvICk7XG5cdH0sXG5cblx0b25FbGVtZW50Q2hhbmdlOiBmdW5jdGlvbiggcHJvcGVydHlOYW1lICkge1xuXHRcdGlmICggJ2xpZ2h0Ym94X2NvbnRlbnRfYW5pbWF0aW9uJyA9PT0gcHJvcGVydHlOYW1lICkge1xuXHRcdFx0dGhpcy5hbmltYXRlVmlkZW8oKTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBpc0xpZ2h0Qm94RW5hYmxlZCA9IHRoaXMuZ2V0RWxlbWVudFNldHRpbmdzKCAnbGlnaHRib3gnICk7XG5cblx0XHRpZiAoICdsaWdodGJveCcgPT09IHByb3BlcnR5TmFtZSAmJiAhIGlzTGlnaHRCb3hFbmFibGVkICkge1xuXHRcdFx0dGhpcy5nZXRMaWdodEJveCgpLmdldE1vZGFsKCkuaGlkZSgpO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCAnYXNwZWN0X3JhdGlvJyA9PT0gcHJvcGVydHlOYW1lICYmIGlzTGlnaHRCb3hFbmFibGVkICkge1xuXHRcdFx0dGhpcy5oYW5kbGVBc3BlY3RSYXRpbygpO1xuXHRcdH1cblx0fVxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUgKSB7XG5cdG5ldyBWaWRlb01vZHVsZSggeyAkZWxlbWVudDogJHNjb3BlIH0gKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCAkc2NvcGUsICQgKSB7XG5cdGlmICggISBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCkgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0aWYgKCAkc2NvcGUuaGFzQ2xhc3MoICdlbGVtZW50b3Itd2lkZ2V0LWVkaXQtZGlzYWJsZWQnICkgKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0JHNjb3BlLmZpbmQoICcuZWxlbWVudG9yLWVsZW1lbnQnICkuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQuZWxlbWVudHNIYW5kbGVyLnJ1blJlYWR5VHJpZ2dlciggJCggdGhpcyApICk7XG5cdH0gKTtcbn07XG4iLCJ2YXIgVmlld01vZHVsZSA9IHJlcXVpcmUoICcuLi8uLi91dGlscy92aWV3LW1vZHVsZScgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBWaWV3TW9kdWxlLmV4dGVuZCgge1xuXHRnZXREZWZhdWx0U2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRlbGVtZW50OiBudWxsLFxuXHRcdFx0ZGlyZWN0aW9uOiBlbGVtZW50b3JGcm9udGVuZC5jb25maWcuaXNfcnRsID8gJ3JpZ2h0JyA6ICdsZWZ0Jyxcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRjb250YWluZXI6IHdpbmRvd1xuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0RGVmYXVsdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0JGVsZW1lbnQ6IGpRdWVyeSggdGhpcy5nZXRTZXR0aW5ncyggJ2VsZW1lbnQnICkgKVxuXHRcdH07XG5cdH0sXG5cblx0c3RyZXRjaDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvbnRhaW5lclNlbGVjdG9yID0gdGhpcy5nZXRTZXR0aW5ncyggJ3NlbGVjdG9ycy5jb250YWluZXInICksXG5cdFx0XHQkZWxlbWVudCA9IHRoaXMuZWxlbWVudHMuJGVsZW1lbnQsXG5cdFx0XHQkY29udGFpbmVyID0galF1ZXJ5KCBjb250YWluZXJTZWxlY3RvciApLFxuXHRcdFx0aXNTcGVjaWFsQ29udGFpbmVyID0gd2luZG93ICE9PSAkY29udGFpbmVyWzBdO1xuXG5cdFx0dGhpcy5yZXNldCgpO1xuXG5cdFx0dmFyIGNvbnRhaW5lcldpZHRoID0gJGNvbnRhaW5lci5vdXRlcldpZHRoKCksXG5cdFx0XHRlbGVtZW50V2lkdGggPSAkZWxlbWVudC5vdXRlcldpZHRoKCksXG5cdFx0XHRlbGVtZW50T2Zmc2V0ID0gJGVsZW1lbnQub2Zmc2V0KCkubGVmdCxcblx0XHRcdGNvcnJlY3RPZmZzZXQgPSBlbGVtZW50T2Zmc2V0O1xuXG5cdFx0aWYgKCBpc1NwZWNpYWxDb250YWluZXIgKSB7XG5cdFx0XHR2YXIgY29udGFpbmVyT2Zmc2V0ID0gJGNvbnRhaW5lci5vZmZzZXQoKS5sZWZ0O1xuXG5cdFx0XHRpZiAoIGVsZW1lbnRPZmZzZXQgPiBjb250YWluZXJPZmZzZXQgKSB7XG5cdFx0XHRcdGNvcnJlY3RPZmZzZXQgPSBlbGVtZW50T2Zmc2V0IC0gY29udGFpbmVyT2Zmc2V0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29ycmVjdE9mZnNldCA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBlbGVtZW50b3JGcm9udGVuZC5jb25maWcuaXNfcnRsICkge1xuXHRcdFx0Y29ycmVjdE9mZnNldCA9IGNvbnRhaW5lcldpZHRoIC0gKCBlbGVtZW50V2lkdGggKyBjb3JyZWN0T2Zmc2V0ICk7XG5cdFx0fVxuXG5cdFx0dmFyIGNzcyA9IHt9O1xuXG5cdFx0Y3NzLndpZHRoID0gY29udGFpbmVyV2lkdGggKyAncHgnO1xuXG5cdFx0Y3NzWyB0aGlzLmdldFNldHRpbmdzKCAnZGlyZWN0aW9uJyApIF0gPSAtY29ycmVjdE9mZnNldCArICdweCc7XG5cblx0XHQkZWxlbWVudC5jc3MoIGNzcyApO1xuXHR9LFxuXG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY3NzID0ge307XG5cblx0XHRjc3Mud2lkdGggPSAnYXV0byc7XG5cblx0XHRjc3NbIHRoaXMuZ2V0U2V0dGluZ3MoICdkaXJlY3Rpb24nICkgXSA9IDA7XG5cblx0XHR0aGlzLmVsZW1lbnRzLiRlbGVtZW50LmNzcyggY3NzICk7XG5cdH1cbn0gKTtcbiIsInZhciBWaWV3TW9kdWxlID0gcmVxdWlyZSggJy4uLy4uL3V0aWxzL3ZpZXctbW9kdWxlJyApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdNb2R1bGUuZXh0ZW5kKCB7XG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2Nyb2xsRHVyYXRpb246IDUwMCxcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRsaW5rczogJ2FbaHJlZio9XCIjXCJdJyxcblx0XHRcdFx0dGFyZ2V0czogJy5lbGVtZW50b3ItZWxlbWVudCwgLmVsZW1lbnRvci1tZW51LWFuY2hvcicsXG5cdFx0XHRcdHNjcm9sbGFibGU6ICdodG1sLCBib2R5Jyxcblx0XHRcdFx0d3BBZG1pbkJhcjogJyN3cGFkbWluYmFyJ1xuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0RGVmYXVsdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgJCA9IGpRdWVyeSxcblx0XHRcdHNlbGVjdG9ycyA9IHRoaXMuZ2V0U2V0dGluZ3MoICdzZWxlY3RvcnMnICk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0JHNjcm9sbGFibGU6ICQoIHNlbGVjdG9ycy5zY3JvbGxhYmxlICksXG5cdFx0XHQkd3BBZG1pbkJhcjogJCggc2VsZWN0b3JzLndwQWRtaW5CYXIgKVxuXHRcdH07XG5cdH0sXG5cblx0YmluZEV2ZW50czogZnVuY3Rpb24oKSB7XG5cdFx0ZWxlbWVudG9yRnJvbnRlbmQuZ2V0RWxlbWVudHMoICckZG9jdW1lbnQnICkub24oICdjbGljaycsIHRoaXMuZ2V0U2V0dGluZ3MoICdzZWxlY3RvcnMubGlua3MnICksIHRoaXMuaGFuZGxlQW5jaG9yTGlua3MgKTtcblx0fSxcblxuXHRoYW5kbGVBbmNob3JMaW5rczogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBjbGlja2VkTGluayA9IGV2ZW50LmN1cnJlbnRUYXJnZXQsXG5cdFx0XHRpc1NhbWVQYXRobmFtZSA9ICggbG9jYXRpb24ucGF0aG5hbWUgPT09IGNsaWNrZWRMaW5rLnBhdGhuYW1lICksXG5cdFx0XHRpc1NhbWVIb3N0bmFtZSA9ICggbG9jYXRpb24uaG9zdG5hbWUgPT09IGNsaWNrZWRMaW5rLmhvc3RuYW1lICk7XG5cblx0XHRpZiAoICEgaXNTYW1lSG9zdG5hbWUgfHwgISBpc1NhbWVQYXRobmFtZSB8fCBjbGlja2VkTGluay5oYXNoLmxlbmd0aCA8IDIgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyICRhbmNob3IgPSBqUXVlcnkoIGNsaWNrZWRMaW5rLmhhc2ggKS5maWx0ZXIoIHRoaXMuZ2V0U2V0dGluZ3MoICdzZWxlY3RvcnMudGFyZ2V0cycgKSApO1xuXG5cdFx0aWYgKCAhICRhbmNob3IubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBoYXNBZG1pbkJhciA9ICggMSA8PSB0aGlzLmVsZW1lbnRzLiR3cEFkbWluQmFyLmxlbmd0aCApLFxuXHRcdFx0c2Nyb2xsVG9wID0gJGFuY2hvci5vZmZzZXQoKS50b3A7XG5cblx0XHRpZiAoIGhhc0FkbWluQmFyICkge1xuXHRcdFx0c2Nyb2xsVG9wIC09IHRoaXMuZWxlbWVudHMuJHdwQWRtaW5CYXIuaGVpZ2h0KCk7XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHNjcm9sbFRvcCA9IGVsZW1lbnRvckZyb250ZW5kLmhvb2tzLmFwcGx5RmlsdGVycyggJ2Zyb250ZW5kL2hhbmRsZXJzL21lbnVfYW5jaG9yL3Njcm9sbF90b3BfZGlzdGFuY2UnLCBzY3JvbGxUb3AgKTtcblxuXHRcdHRoaXMuZWxlbWVudHMuJHNjcm9sbGFibGUuYW5pbWF0ZSgge1xuXHRcdFx0c2Nyb2xsVG9wOiBzY3JvbGxUb3Bcblx0XHR9LCB0aGlzLmdldFNldHRpbmdzKCAnc2Nyb2xsRHVyYXRpb24nICksICdsaW5lYXInICk7XG5cdH0sXG5cblx0b25Jbml0OiBmdW5jdGlvbigpIHtcblx0XHRWaWV3TW9kdWxlLnByb3RvdHlwZS5vbkluaXQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdH1cbn0gKTtcbiIsInZhciBWaWV3TW9kdWxlID0gcmVxdWlyZSggJy4uLy4uL3V0aWxzL3ZpZXctbW9kdWxlJyApLFxuXHRMaWdodGJveE1vZHVsZTtcblxuTGlnaHRib3hNb2R1bGUgPSBWaWV3TW9kdWxlLmV4dGVuZCgge1xuXHRvbGRBc3BlY3RSYXRpbzogbnVsbCxcblxuXHRvbGRBbmltYXRpb246IG51bGwsXG5cblx0c3dpcGVyOiBudWxsLFxuXG5cdGdldERlZmF1bHRTZXR0aW5nczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNsYXNzZXM6IHtcblx0XHRcdFx0YXNwZWN0UmF0aW86ICdlbGVtZW50b3ItYXNwZWN0LXJhdGlvLSVzJyxcblx0XHRcdFx0aXRlbTogJ2VsZW1lbnRvci1saWdodGJveC1pdGVtJyxcblx0XHRcdFx0aW1hZ2U6ICdlbGVtZW50b3ItbGlnaHRib3gtaW1hZ2UnLFxuXHRcdFx0XHR2aWRlb0NvbnRhaW5lcjogJ2VsZW1lbnRvci12aWRlby1jb250YWluZXInLFxuXHRcdFx0XHR2aWRlb1dyYXBwZXI6ICdlbGVtZW50b3ItZml0LWFzcGVjdC1yYXRpbycsXG5cdFx0XHRcdHBsYXlCdXR0b246ICdlbGVtZW50b3ItY3VzdG9tLWVtYmVkLXBsYXknLFxuXHRcdFx0XHRwbGF5QnV0dG9uSWNvbjogJ2ZhJyxcblx0XHRcdFx0cGxheWluZzogJ2VsZW1lbnRvci1wbGF5aW5nJyxcblx0XHRcdFx0aGlkZGVuOiAnZWxlbWVudG9yLWhpZGRlbicsXG5cdFx0XHRcdGludmlzaWJsZTogJ2VsZW1lbnRvci1pbnZpc2libGUnLFxuXHRcdFx0XHRwcmV2ZW50Q2xvc2U6ICdlbGVtZW50b3ItbGlnaHRib3gtcHJldmVudC1jbG9zZScsXG5cdFx0XHRcdHNsaWRlc2hvdzoge1xuXHRcdFx0XHRcdGNvbnRhaW5lcjogJ3N3aXBlci1jb250YWluZXInLFxuXHRcdFx0XHRcdHNsaWRlc1dyYXBwZXI6ICdzd2lwZXItd3JhcHBlcicsXG5cdFx0XHRcdFx0cHJldkJ1dHRvbjogJ2VsZW1lbnRvci1zd2lwZXItYnV0dG9uIGVsZW1lbnRvci1zd2lwZXItYnV0dG9uLXByZXYnLFxuXHRcdFx0XHRcdG5leHRCdXR0b246ICdlbGVtZW50b3Itc3dpcGVyLWJ1dHRvbiBlbGVtZW50b3Itc3dpcGVyLWJ1dHRvbi1uZXh0Jyxcblx0XHRcdFx0XHRwcmV2QnV0dG9uSWNvbjogJ2VpY29uLWNoZXZyb24tbGVmdCcsXG5cdFx0XHRcdFx0bmV4dEJ1dHRvbkljb246ICdlaWNvbi1jaGV2cm9uLXJpZ2h0Jyxcblx0XHRcdFx0XHRzbGlkZTogJ3N3aXBlci1zbGlkZSdcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRsaW5rczogJ2EsIFtkYXRhLWVsZW1lbnRvci1saWdodGJveF0nLFxuXHRcdFx0XHRzbGlkZXNob3c6IHtcblx0XHRcdFx0XHRhY3RpdmVTbGlkZTogJy5zd2lwZXItc2xpZGUtYWN0aXZlJyxcblx0XHRcdFx0XHRwcmV2U2xpZGU6ICcuc3dpcGVyLXNsaWRlLXByZXYnLFxuXHRcdFx0XHRcdG5leHRTbGlkZTogJy5zd2lwZXItc2xpZGUtbmV4dCdcblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdG1vZGFsT3B0aW9uczoge1xuXHRcdFx0XHRpZDogJ2VsZW1lbnRvci1saWdodGJveCcsXG5cdFx0XHRcdGVudHJhbmNlQW5pbWF0aW9uOiAnem9vbUluJyxcblx0XHRcdFx0dmlkZW9Bc3BlY3RSYXRpbzogMTY5LFxuXHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdGVuYWJsZTogZmFsc2Vcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdH0sXG5cblx0Z2V0TW9kYWw6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISBMaWdodGJveE1vZHVsZS5tb2RhbCApIHtcblx0XHRcdHRoaXMuaW5pdE1vZGFsKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIExpZ2h0Ym94TW9kdWxlLm1vZGFsO1xuXHR9LFxuXG5cdGluaXRNb2RhbDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG1vZGFsID0gTGlnaHRib3hNb2R1bGUubW9kYWwgPSBlbGVtZW50b3JGcm9udGVuZC5nZXREaWFsb2dzTWFuYWdlcigpLmNyZWF0ZVdpZGdldCggJ2xpZ2h0Ym94Jywge1xuXHRcdFx0Y2xhc3NOYW1lOiAnZWxlbWVudG9yLWxpZ2h0Ym94Jyxcblx0XHRcdGNsb3NlQnV0dG9uOiB0cnVlLFxuXHRcdFx0Y2xvc2VCdXR0b25DbGFzczogJ2VpY29uLWNsb3NlJyxcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRwcmV2ZW50Q2xvc2U6ICcuJyArIHRoaXMuZ2V0U2V0dGluZ3MoICdjbGFzc2VzLnByZXZlbnRDbG9zZScgKVxuXHRcdFx0fSxcblx0XHRcdGhpZGU6IHtcblx0XHRcdFx0b25DbGljazogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0gKTtcblxuXHRcdG1vZGFsLm9uKCAnaGlkZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0bW9kYWwuc2V0TWVzc2FnZSggJycgKTtcblx0XHR9ICk7XG5cdH0sXG5cblx0c2hvd01vZGFsOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgc2VsZiA9IHRoaXMsXG5cdFx0XHRkZWZhdWx0T3B0aW9ucyA9IHNlbGYuZ2V0RGVmYXVsdFNldHRpbmdzKCkubW9kYWxPcHRpb25zO1xuXG5cdFx0c2VsZi5zZXRTZXR0aW5ncyggJ21vZGFsT3B0aW9ucycsIGpRdWVyeS5leHRlbmQoIGRlZmF1bHRPcHRpb25zLCBvcHRpb25zLm1vZGFsT3B0aW9ucyApICk7XG5cblx0XHR2YXIgbW9kYWwgPSBzZWxmLmdldE1vZGFsKCk7XG5cblx0XHRtb2RhbC5zZXRJRCggc2VsZi5nZXRTZXR0aW5ncyggJ21vZGFsT3B0aW9ucy5pZCcgKSApO1xuXG5cdFx0bW9kYWwub25TaG93ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnbGlnaHRib3gnICkucHJvdG90eXBlLm9uU2hvdy5hcHBseSggbW9kYWwsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0c2VsZi5zZXRFbnRyYW5jZUFuaW1hdGlvbigpO1xuXHRcdFx0fSwgMTAgKTtcblx0XHR9O1xuXG5cdFx0bW9kYWwub25IaWRlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHREaWFsb2dzTWFuYWdlci5nZXRXaWRnZXRUeXBlKCAnbGlnaHRib3gnICkucHJvdG90eXBlLm9uSGlkZS5hcHBseSggbW9kYWwsIGFyZ3VtZW50cyApO1xuXG5cdFx0XHRtb2RhbC5nZXRFbGVtZW50cyggJ3dpZGdldENvbnRlbnQnICkucmVtb3ZlQ2xhc3MoICdhbmltYXRlZCcgKTtcblx0XHR9O1xuXG5cdFx0c3dpdGNoICggb3B0aW9ucy50eXBlICkge1xuXHRcdFx0Y2FzZSAnaW1hZ2UnOlxuXHRcdFx0XHRzZWxmLnNldEltYWdlQ29udGVudCggb3B0aW9ucy51cmwgKTtcblxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgJ3ZpZGVvJzpcblx0XHRcdFx0c2VsZi5zZXRWaWRlb0NvbnRlbnQoIG9wdGlvbnMudXJsICk7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdzbGlkZXNob3cnOlxuXHRcdFx0XHRzZWxmLnNldFNsaWRlc2hvd0NvbnRlbnQoIG9wdGlvbnMuc2xpZGVzaG93ICk7XG5cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRzZWxmLnNldEhUTUxDb250ZW50KCBvcHRpb25zLmh0bWwgKTtcblx0XHR9XG5cblx0XHRtb2RhbC5zaG93KCk7XG5cdH0sXG5cblx0c2V0SFRNTENvbnRlbnQ6IGZ1bmN0aW9uKCBodG1sICkge1xuXHRcdHRoaXMuZ2V0TW9kYWwoKS5zZXRNZXNzYWdlKCBodG1sICk7XG5cdH0sXG5cblx0c2V0SW1hZ2VDb250ZW50OiBmdW5jdGlvbiggaW1hZ2VVUkwgKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzLFxuXHRcdFx0Y2xhc3NlcyA9IHNlbGYuZ2V0U2V0dGluZ3MoICdjbGFzc2VzJyApLFxuXHRcdFx0JGl0ZW0gPSBqUXVlcnkoICc8ZGl2PicsIHsgJ2NsYXNzJzogY2xhc3Nlcy5pdGVtIH0gKSxcblx0XHRcdCRpbWFnZSA9IGpRdWVyeSggJzxpbWc+JywgeyBzcmM6IGltYWdlVVJMLCAnY2xhc3MnOiBjbGFzc2VzLmltYWdlICsgJyAnICsgY2xhc3Nlcy5wcmV2ZW50Q2xvc2UgfSApO1xuXG5cdFx0JGl0ZW0uYXBwZW5kKCAkaW1hZ2UgKTtcblxuXHRcdHNlbGYuZ2V0TW9kYWwoKS5zZXRNZXNzYWdlKCAkaXRlbSApO1xuXHR9LFxuXG5cdHNldFZpZGVvQ29udGVudDogZnVuY3Rpb24oIHZpZGVvRW1iZWRVUkwgKSB7XG5cdFx0dmlkZW9FbWJlZFVSTCA9IHZpZGVvRW1iZWRVUkwucmVwbGFjZSggJyZhdXRvcGxheT0wJywgJycgKSArICcmYXV0b3BsYXk9MSc7XG5cblx0XHR2YXIgY2xhc3NlcyA9IHRoaXMuZ2V0U2V0dGluZ3MoICdjbGFzc2VzJyApLFxuXHRcdFx0JHZpZGVvQ29udGFpbmVyID0galF1ZXJ5KCAnPGRpdj4nLCB7ICdjbGFzcyc6IGNsYXNzZXMudmlkZW9Db250YWluZXIgfSApLFxuXHRcdFx0JHZpZGVvV3JhcHBlciA9IGpRdWVyeSggJzxkaXY+JywgeyAnY2xhc3MnOiBjbGFzc2VzLnZpZGVvV3JhcHBlciB9ICksXG5cdFx0XHQkdmlkZW9GcmFtZSA9IGpRdWVyeSggJzxpZnJhbWU+JywgeyBzcmM6IHZpZGVvRW1iZWRVUkwsIGFsbG93ZnVsbHNjcmVlbjogMSB9ICksXG5cdFx0XHRtb2RhbCA9IHRoaXMuZ2V0TW9kYWwoKTtcblxuXHRcdCR2aWRlb0NvbnRhaW5lci5hcHBlbmQoICR2aWRlb1dyYXBwZXIgKTtcblxuXHRcdCR2aWRlb1dyYXBwZXIuYXBwZW5kKCAkdmlkZW9GcmFtZSApO1xuXG5cdFx0bW9kYWwuc2V0TWVzc2FnZSggJHZpZGVvQ29udGFpbmVyICk7XG5cblx0XHR0aGlzLnNldFZpZGVvQXNwZWN0UmF0aW8oKTtcblxuXHRcdHZhciBvbkhpZGVNZXRob2QgPSBtb2RhbC5vbkhpZGU7XG5cblx0XHRtb2RhbC5vbkhpZGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdG9uSGlkZU1ldGhvZCgpO1xuXG5cdFx0XHRtb2RhbC5nZXRFbGVtZW50cyggJ21lc3NhZ2UnICkucmVtb3ZlQ2xhc3MoICdlbGVtZW50b3ItZml0LWFzcGVjdC1yYXRpbycgKTtcblx0XHR9O1xuXHR9LFxuXG5cdHNldFNsaWRlc2hvd0NvbnRlbnQ6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciAkID0galF1ZXJ5LFxuXHRcdFx0c2VsZiA9IHRoaXMsXG5cdFx0XHRjbGFzc2VzID0gc2VsZi5nZXRTZXR0aW5ncyggJ2NsYXNzZXMnICksXG5cdFx0XHRzbGlkZXNob3dDbGFzc2VzID0gY2xhc3Nlcy5zbGlkZXNob3csXG5cdFx0XHQkY29udGFpbmVyID0gJCggJzxkaXY+JywgeyAnY2xhc3MnOiBzbGlkZXNob3dDbGFzc2VzLmNvbnRhaW5lciB9ICksXG5cdFx0XHQkc2xpZGVzV3JhcHBlciA9ICQoICc8ZGl2PicsIHsgJ2NsYXNzJzogc2xpZGVzaG93Q2xhc3Nlcy5zbGlkZXNXcmFwcGVyIH0gKSxcblx0XHRcdCRwcmV2QnV0dG9uID0gJCggJzxkaXY+JywgeyAnY2xhc3MnOiBzbGlkZXNob3dDbGFzc2VzLnByZXZCdXR0b24gKyAnICcgKyBjbGFzc2VzLnByZXZlbnRDbG9zZSB9ICkuaHRtbCggJCggJzxpPicsIHsgJ2NsYXNzJzogc2xpZGVzaG93Q2xhc3Nlcy5wcmV2QnV0dG9uSWNvbiB9ICkgKSxcblx0XHRcdCRuZXh0QnV0dG9uID0gJCggJzxkaXY+JywgeyAnY2xhc3MnOiBzbGlkZXNob3dDbGFzc2VzLm5leHRCdXR0b24gKyAnICcgKyBjbGFzc2VzLnByZXZlbnRDbG9zZSB9ICkuaHRtbCggJCggJzxpPicsIHsgJ2NsYXNzJzogc2xpZGVzaG93Q2xhc3Nlcy5uZXh0QnV0dG9uSWNvbiB9ICkgKTtcblxuXHRcdG9wdGlvbnMuc2xpZGVzLmZvckVhY2goIGZ1bmN0aW9uKCBzbGlkZSApIHtcblx0XHRcdHZhciBzbGlkZUNsYXNzID0gIHNsaWRlc2hvd0NsYXNzZXMuc2xpZGUgKyAnICcgKyBjbGFzc2VzLml0ZW07XG5cblx0XHRcdGlmICggc2xpZGUudmlkZW8gKSB7XG5cdFx0XHRcdHNsaWRlQ2xhc3MgKz0gJyAnICsgY2xhc3Nlcy52aWRlbztcblx0XHRcdH1cblxuXHRcdFx0dmFyICRzbGlkZSA9ICQoICc8ZGl2PicsIHsgJ2NsYXNzJzogc2xpZGVDbGFzcyB9ICk7XG5cblx0XHRcdGlmICggc2xpZGUudmlkZW8gKSB7XG5cdFx0XHRcdCRzbGlkZS5hdHRyKCAnZGF0YS1lbGVtZW50b3Itc2xpZGVzaG93LXZpZGVvJywgc2xpZGUudmlkZW8gKTtcblxuXHRcdFx0XHR2YXIgJHBsYXlJY29uID0gJCggJzxkaXY+JywgeyAnY2xhc3MnOiBjbGFzc2VzLnBsYXlCdXR0b24gfSApLmh0bWwoICQoICc8aT4nLCB7ICdjbGFzcyc6IGNsYXNzZXMucGxheUJ1dHRvbkljb24gfSApICk7XG5cblx0XHRcdFx0JHNsaWRlLmFwcGVuZCggJHBsYXlJY29uICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgJHpvb21Db250YWluZXIgPSAkKCAnPGRpdj4nLCB7ICdjbGFzcyc6ICdzd2lwZXItem9vbS1jb250YWluZXInIH0gKSxcblx0XHRcdFx0XHQkc2xpZGVJbWFnZSA9ICQoICc8aW1nPicsIHsgJ2NsYXNzJzogY2xhc3Nlcy5pbWFnZSArICcgJyArIGNsYXNzZXMucHJldmVudENsb3NlIH0gKS5hdHRyKCAnc3JjJywgc2xpZGUuaW1hZ2UgKTtcblxuXHRcdFx0XHQkem9vbUNvbnRhaW5lci5hcHBlbmQoICRzbGlkZUltYWdlICk7XG5cblx0XHRcdFx0JHNsaWRlLmFwcGVuZCggJHpvb21Db250YWluZXIgKTtcblx0XHRcdH1cblxuXHRcdFx0JHNsaWRlc1dyYXBwZXIuYXBwZW5kKCAkc2xpZGUgKTtcblx0XHR9ICk7XG5cblx0XHQkY29udGFpbmVyLmFwcGVuZChcblx0XHRcdCRzbGlkZXNXcmFwcGVyLFxuXHRcdFx0JHByZXZCdXR0b24sXG5cdFx0XHQkbmV4dEJ1dHRvblxuXHRcdCk7XG5cblx0XHR2YXIgbW9kYWwgPSBzZWxmLmdldE1vZGFsKCk7XG5cblx0XHRtb2RhbC5zZXRNZXNzYWdlKCAkY29udGFpbmVyICk7XG5cblx0XHR2YXIgb25TaG93TWV0aG9kID0gbW9kYWwub25TaG93O1xuXG5cdFx0bW9kYWwub25TaG93ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRvblNob3dNZXRob2QoKTtcblxuXHRcdFx0dmFyIHN3aXBlck9wdGlvbnMgPSB7XG5cdFx0XHRcdHByZXZCdXR0b246ICRwcmV2QnV0dG9uLFxuXHRcdFx0XHRuZXh0QnV0dG9uOiAkbmV4dEJ1dHRvbixcblx0XHRcdFx0cGFnaW5hdGlvbkNsaWNrYWJsZTogdHJ1ZSxcblx0XHRcdFx0Z3JhYkN1cnNvcjogdHJ1ZSxcblx0XHRcdFx0b25TbGlkZUNoYW5nZUVuZDogc2VsZi5vblNsaWRlQ2hhbmdlLFxuXHRcdFx0XHRydW5DYWxsYmFja3NPbkluaXQ6IGZhbHNlLFxuXHRcdFx0XHRsb29wOiB0cnVlLFxuXHRcdFx0XHRrZXlib2FyZENvbnRyb2w6IHRydWVcblx0XHRcdH07XG5cblx0XHRcdGlmICggb3B0aW9ucy5zd2lwZXIgKSB7XG5cdFx0XHRcdCQuZXh0ZW5kKCBzd2lwZXJPcHRpb25zLCBvcHRpb25zLnN3aXBlciApO1xuXHRcdFx0fVxuXG5cdFx0XHRzZWxmLnN3aXBlciA9IG5ldyBTd2lwZXIoICRjb250YWluZXIsIHN3aXBlck9wdGlvbnMgKTtcblxuXHRcdFx0c2VsZi5zZXRWaWRlb0FzcGVjdFJhdGlvKCk7XG5cblx0XHRcdHNlbGYucGxheVNsaWRlVmlkZW8oKTtcblx0XHR9O1xuXHR9LFxuXG5cdHNldFZpZGVvQXNwZWN0UmF0aW86IGZ1bmN0aW9uKCBhc3BlY3RSYXRpbyApIHtcblx0XHRhc3BlY3RSYXRpbyA9IGFzcGVjdFJhdGlvIHx8IHRoaXMuZ2V0U2V0dGluZ3MoICdtb2RhbE9wdGlvbnMudmlkZW9Bc3BlY3RSYXRpbycgKTtcblxuXHRcdHZhciAkd2lkZ2V0Q29udGVudCA9IHRoaXMuZ2V0TW9kYWwoKS5nZXRFbGVtZW50cyggJ3dpZGdldENvbnRlbnQnICksXG5cdFx0XHRvbGRBc3BlY3RSYXRpbyA9IHRoaXMub2xkQXNwZWN0UmF0aW8sXG5cdFx0XHRhc3BlY3RSYXRpb0NsYXNzID0gdGhpcy5nZXRTZXR0aW5ncyggJ2NsYXNzZXMuYXNwZWN0UmF0aW8nICk7XG5cblx0XHR0aGlzLm9sZEFzcGVjdFJhdGlvID0gYXNwZWN0UmF0aW87XG5cblx0XHRpZiAoIG9sZEFzcGVjdFJhdGlvICkge1xuXHRcdFx0JHdpZGdldENvbnRlbnQucmVtb3ZlQ2xhc3MoIGFzcGVjdFJhdGlvQ2xhc3MucmVwbGFjZSggJyVzJywgb2xkQXNwZWN0UmF0aW8gKSApO1xuXHRcdH1cblxuXHRcdGlmICggYXNwZWN0UmF0aW8gKSB7XG5cdFx0XHQkd2lkZ2V0Q29udGVudC5hZGRDbGFzcyggYXNwZWN0UmF0aW9DbGFzcy5yZXBsYWNlKCAnJXMnLCBhc3BlY3RSYXRpbyApICk7XG5cdFx0fVxuXHR9LFxuXG5cdGdldFNsaWRlOiBmdW5jdGlvbiggc2xpZGVTdGF0ZSApIHtcblx0XHRyZXR1cm4gdGhpcy5zd2lwZXIuc2xpZGVzLmZpbHRlciggdGhpcy5nZXRTZXR0aW5ncyggJ3NlbGVjdG9ycy5zbGlkZXNob3cuJyArIHNsaWRlU3RhdGUgKyAnU2xpZGUnICkgKTtcblx0fSxcblxuXHRwbGF5U2xpZGVWaWRlbzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRhY3RpdmVTbGlkZSA9IHRoaXMuZ2V0U2xpZGUoICdhY3RpdmUnICksXG5cdFx0XHR2aWRlb1VSTCA9ICRhY3RpdmVTbGlkZS5kYXRhKCAnZWxlbWVudG9yLXNsaWRlc2hvdy12aWRlbycgKTtcblxuXHRcdGlmICggISB2aWRlb1VSTCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgY2xhc3NlcyA9IHRoaXMuZ2V0U2V0dGluZ3MoICdjbGFzc2VzJyApO1xuXG5cdFx0dmFyICR2aWRlb0NvbnRhaW5lciA9IGpRdWVyeSggJzxkaXY+JywgeyAnY2xhc3MnOiBjbGFzc2VzLnZpZGVvQ29udGFpbmVyICsgJyAnICsgY2xhc3Nlcy5pbnZpc2libGUgfSApLFxuXHRcdFx0JHZpZGVvV3JhcHBlciA9IGpRdWVyeSggJzxkaXY+JywgeyAnY2xhc3MnOiBjbGFzc2VzLnZpZGVvV3JhcHBlciB9ICksXG5cdFx0XHQkdmlkZW9GcmFtZSA9IGpRdWVyeSggJzxpZnJhbWU+JywgeyBzcmM6IHZpZGVvVVJMIH0gKSxcblx0XHRcdCRwbGF5SWNvbiA9ICRhY3RpdmVTbGlkZS5jaGlsZHJlbiggJy4nICsgY2xhc3Nlcy5wbGF5QnV0dG9uICk7XG5cblx0XHQkdmlkZW9Db250YWluZXIuYXBwZW5kKCAkdmlkZW9XcmFwcGVyICk7XG5cblx0XHQkdmlkZW9XcmFwcGVyLmFwcGVuZCggJHZpZGVvRnJhbWUgKTtcblxuXHRcdCRhY3RpdmVTbGlkZS5hcHBlbmQoICR2aWRlb0NvbnRhaW5lciApO1xuXG5cdFx0JHBsYXlJY29uLmFkZENsYXNzKCBjbGFzc2VzLnBsYXlpbmcgKS5yZW1vdmVDbGFzcyggY2xhc3Nlcy5oaWRkZW4gKTtcblxuXHRcdCR2aWRlb0ZyYW1lLm9uKCAnbG9hZCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0JHBsYXlJY29uLmFkZENsYXNzKCBjbGFzc2VzLmhpZGRlbiApO1xuXG5cdFx0XHQkdmlkZW9Db250YWluZXIucmVtb3ZlQ2xhc3MoIGNsYXNzZXMuaW52aXNpYmxlICk7XG5cdFx0fSApO1xuXHR9LFxuXG5cdHNldEVudHJhbmNlQW5pbWF0aW9uOiBmdW5jdGlvbiggYW5pbWF0aW9uICkge1xuXHRcdGFuaW1hdGlvbiA9IGFuaW1hdGlvbiB8fCB0aGlzLmdldFNldHRpbmdzKCAnbW9kYWxPcHRpb25zLmVudHJhbmNlQW5pbWF0aW9uJyApO1xuXG5cdFx0dmFyICR3aWRnZXRNZXNzYWdlID0gdGhpcy5nZXRNb2RhbCgpLmdldEVsZW1lbnRzKCAnbWVzc2FnZScgKTtcblxuXHRcdGlmICggdGhpcy5vbGRBbmltYXRpb24gKSB7XG5cdFx0XHQkd2lkZ2V0TWVzc2FnZS5yZW1vdmVDbGFzcyggdGhpcy5vbGRBbmltYXRpb24gKTtcblx0XHR9XG5cblx0XHR0aGlzLm9sZEFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcblxuXHRcdGlmICggYW5pbWF0aW9uICkge1xuXHRcdFx0JHdpZGdldE1lc3NhZ2UuYWRkQ2xhc3MoICdhbmltYXRlZCAnICsgYW5pbWF0aW9uICk7XG5cdFx0fVxuXHR9LFxuXG5cdGlzTGlnaHRib3hMaW5rOiBmdW5jdGlvbiggZWxlbWVudCApIHtcblx0XHRpZiAoICdBJyA9PT0gZWxlbWVudC50YWdOYW1lICYmICEgL1xcLihwbmd8anBlP2d8Z2lmfHN2ZykkL2kudGVzdCggZWxlbWVudC5ocmVmICkgKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0dmFyIGdlbmVyYWxPcGVuSW5MaWdodGJveCA9IGVsZW1lbnRvckZyb250ZW5kLmdldEdlbmVyYWxTZXR0aW5ncyggJ2VsZW1lbnRvcl9nbG9iYWxfaW1hZ2VfbGlnaHRib3gnICksXG5cdFx0XHRjdXJyZW50TGlua09wZW5JbkxpZ2h0Ym94ID0gZWxlbWVudC5kYXRhc2V0LmVsZW1lbnRvck9wZW5MaWdodGJveDtcblxuXHRcdHJldHVybiAneWVzJyA9PT0gY3VycmVudExpbmtPcGVuSW5MaWdodGJveCB8fCBnZW5lcmFsT3BlbkluTGlnaHRib3ggJiYgJ25vJyAhPT0gY3VycmVudExpbmtPcGVuSW5MaWdodGJveDtcblx0fSxcblxuXHRvcGVuTGluazogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBlbGVtZW50ID0gZXZlbnQuY3VycmVudFRhcmdldCxcblx0XHRcdCR0YXJnZXQgPSBqUXVlcnkoIGV2ZW50LnRhcmdldCApLFxuXHRcdFx0ZWRpdE1vZGUgPSBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCksXG5cdFx0XHRpc0NsaWNrSW5zaWRlRWxlbWVudG9yID0gISEgJHRhcmdldC5jbG9zZXN0KCAnI2VsZW1lbnRvcicgKS5sZW5ndGg7XG5cblx0XHRpZiAoICEgdGhpcy5pc0xpZ2h0Ym94TGluayggZWxlbWVudCApICkge1xuXG5cdFx0XHRpZiAoIGVkaXRNb2RlICYmIGlzQ2xpY2tJbnNpZGVFbGVtZW50b3IgKSB7XG5cdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0aWYgKCBlbGVtZW50b3JGcm9udGVuZC5pc0VkaXRNb2RlKCkgJiYgISBlbGVtZW50b3JGcm9udGVuZC5nZXRHZW5lcmFsU2V0dGluZ3MoICdlbGVtZW50b3JfZW5hYmxlX2xpZ2h0Ym94X2luX2VkaXRvcicgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgbGlnaHRib3hEYXRhID0ge307XG5cblx0XHRpZiAoIGVsZW1lbnQuZGF0YXNldC5lbGVtZW50b3JMaWdodGJveCApIHtcblx0XHRcdGxpZ2h0Ym94RGF0YSA9IEpTT04ucGFyc2UoIGVsZW1lbnQuZGF0YXNldC5lbGVtZW50b3JMaWdodGJveCApO1xuXHRcdH1cblxuXHRcdGlmICggbGlnaHRib3hEYXRhLnR5cGUgJiYgJ3NsaWRlc2hvdycgIT09IGxpZ2h0Ym94RGF0YS50eXBlICkge1xuXHRcdFx0dGhpcy5zaG93TW9kYWwoIGxpZ2h0Ym94RGF0YSApO1xuXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCAhIGVsZW1lbnQuZGF0YXNldC5lbGVtZW50b3JMaWdodGJveFNsaWRlc2hvdyApIHtcblx0XHRcdHRoaXMuc2hvd01vZGFsKCB7XG5cdFx0XHRcdHR5cGU6ICdpbWFnZScsXG5cdFx0XHRcdHVybDogZWxlbWVudC5ocmVmXG5cdFx0XHR9ICk7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgc2xpZGVzaG93SUQgPSBlbGVtZW50LmRhdGFzZXQuZWxlbWVudG9yTGlnaHRib3hTbGlkZXNob3c7XG5cblx0XHR2YXIgJGFsbFNsaWRlc2hvd0xpbmtzID0galF1ZXJ5KCB0aGlzLmdldFNldHRpbmdzKCAnc2VsZWN0b3JzLmxpbmtzJyApICkuZmlsdGVyKCBmdW5jdGlvbigpIHtcblx0XHRcdHJldHVybiBzbGlkZXNob3dJRCA9PT0gdGhpcy5kYXRhc2V0LmVsZW1lbnRvckxpZ2h0Ym94U2xpZGVzaG93O1xuXHRcdH0gKTtcblxuXHRcdHZhciBzbGlkZXMgPSBbXSxcblx0XHRcdHVuaXF1ZUxpbmtzID0ge307XG5cblx0XHQkYWxsU2xpZGVzaG93TGlua3MuZWFjaCggZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoIHVuaXF1ZUxpbmtzWyB0aGlzLmhyZWYgXSApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR1bmlxdWVMaW5rc1sgdGhpcy5ocmVmIF0gPSB0cnVlO1xuXG5cdFx0XHR2YXIgc2xpZGVJbmRleCA9IHRoaXMuZGF0YXNldC5lbGVtZW50b3JMaWdodGJveEluZGV4O1xuXG5cdFx0XHRpZiAoIHVuZGVmaW5lZCA9PT0gc2xpZGVJbmRleCApIHtcblx0XHRcdFx0c2xpZGVJbmRleCA9ICRhbGxTbGlkZXNob3dMaW5rcy5pbmRleCggdGhpcyApO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgc2xpZGVEYXRhID0ge1xuXHRcdFx0XHRpbWFnZTogdGhpcy5ocmVmLFxuXHRcdFx0XHRpbmRleDogc2xpZGVJbmRleFxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKCB0aGlzLmRhdGFzZXQuZWxlbWVudG9yTGlnaHRib3hWaWRlbyApIHtcblx0XHRcdFx0c2xpZGVEYXRhLnZpZGVvID0gdGhpcy5kYXRhc2V0LmVsZW1lbnRvckxpZ2h0Ym94VmlkZW87XG5cdFx0XHR9XG5cblx0XHRcdHNsaWRlcy5wdXNoKCBzbGlkZURhdGEgKTtcblx0XHR9ICk7XG5cblx0XHRzbGlkZXMuc29ydCggZnVuY3Rpb24oIGEsIGIgKSB7XG5cdFx0XHRyZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG5cdFx0fSApO1xuXG5cdFx0dmFyIGluaXRpYWxTbGlkZSA9IGVsZW1lbnQuZGF0YXNldC5lbGVtZW50b3JMaWdodGJveEluZGV4O1xuXG5cdFx0aWYgKCB1bmRlZmluZWQgPT09IGluaXRpYWxTbGlkZSApIHtcblx0XHRcdGluaXRpYWxTbGlkZSA9ICRhbGxTbGlkZXNob3dMaW5rcy5pbmRleCggZWxlbWVudCApO1xuXHRcdH1cblxuXHRcdHRoaXMuc2hvd01vZGFsKCB7XG5cdFx0XHR0eXBlOiAnc2xpZGVzaG93Jyxcblx0XHRcdG1vZGFsT3B0aW9uczoge1xuXHRcdFx0XHRpZDogJ2VsZW1lbnRvci1saWdodGJveC1zbGlkZXNob3ctJyArIHNsaWRlc2hvd0lEXG5cdFx0XHR9LFxuXHRcdFx0c2xpZGVzaG93OiB7XG5cdFx0XHRcdHNsaWRlczogc2xpZGVzLFxuXHRcdFx0XHRzd2lwZXI6IHtcblx0XHRcdFx0XHRpbml0aWFsU2xpZGU6ICtpbml0aWFsU2xpZGVcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gKTtcblx0fSxcblxuXHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHRlbGVtZW50b3JGcm9udGVuZC5nZXRFbGVtZW50cyggJyRkb2N1bWVudCcgKS5vbiggJ2NsaWNrJywgdGhpcy5nZXRTZXR0aW5ncyggJ3NlbGVjdG9ycy5saW5rcycgKSwgdGhpcy5vcGVuTGluayApO1xuXHR9LFxuXG5cdG9uSW5pdDogZnVuY3Rpb24oKSB7XG5cdFx0Vmlld01vZHVsZS5wcm90b3R5cGUub25Jbml0LmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdGlmICggZWxlbWVudG9yRnJvbnRlbmQuaXNFZGl0TW9kZSgpICkge1xuXHRcdFx0ZWxlbWVudG9yLnNldHRpbmdzLmdlbmVyYWwubW9kZWwub24oICdjaGFuZ2UnLCB0aGlzLm9uR2VuZXJhbFNldHRpbmdzQ2hhbmdlICk7XG5cdFx0fVxuXHR9LFxuXG5cdG9uR2VuZXJhbFNldHRpbmdzQ2hhbmdlOiBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0aWYgKCAnZWxlbWVudG9yX2xpZ2h0Ym94X2NvbnRlbnRfYW5pbWF0aW9uJyBpbiBtb2RlbC5jaGFuZ2VkICkge1xuXHRcdFx0dGhpcy5zZXRTZXR0aW5ncyggJ21vZGFsT3B0aW9ucy5lbnRyYW5jZUFuaW1hdGlvbicsIG1vZGVsLmNoYW5nZWQuZWxlbWVudG9yX2xpZ2h0Ym94X2NvbnRlbnRfYW5pbWF0aW9uICk7XG5cblx0XHRcdHRoaXMuc2V0RW50cmFuY2VBbmltYXRpb24oKTtcblx0XHR9XG5cdH0sXG5cblx0b25TbGlkZUNoYW5nZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpc1xuXHRcdFx0LmdldFNsaWRlKCAncHJldicgKVxuXHRcdFx0LmFkZCggdGhpcy5nZXRTbGlkZSggJ25leHQnICkgKVxuXHRcdFx0LmFkZCggdGhpcy5nZXRTbGlkZSggJ2FjdGl2ZScgKSApXG5cdFx0XHQuZmluZCggJy4nICsgdGhpcy5nZXRTZXR0aW5ncyggJ2NsYXNzZXMudmlkZW9XcmFwcGVyJyApIClcblx0XHRcdC5yZW1vdmUoKTtcblxuXHRcdHRoaXMucGxheVNsaWRlVmlkZW8oKTtcblx0fVxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpZ2h0Ym94TW9kdWxlO1xuIiwidmFyIFZpZXdNb2R1bGUgPSByZXF1aXJlKCAnLi4vLi4vdXRpbHMvdmlldy1tb2R1bGUnICk7XG5cbm1vZHVsZS5leHBvcnRzID0gVmlld01vZHVsZS5leHRlbmQoIHtcblx0Z2V0RGVmYXVsdFNldHRpbmdzOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aXNJbnNlcnRlZDogZmFsc2UsXG5cdFx0XHRBUElTcmM6ICdodHRwczovL3d3dy55b3V0dWJlLmNvbS9pZnJhbWVfYXBpJyxcblx0XHRcdHNlbGVjdG9yczoge1xuXHRcdFx0XHRmaXJzdFNjcmlwdDogJ3NjcmlwdDpmaXJzdCdcblx0XHRcdH1cblx0XHR9O1xuXHR9LFxuXG5cdGdldERlZmF1bHRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdCRmaXJzdFNjcmlwdDogalF1ZXJ5KCB0aGlzLmdldFNldHRpbmdzKCAnc2VsZWN0b3JzLmZpcnN0U2NyaXB0JyApIClcblx0XHR9O1xuXHR9LFxuXG5cdGluc2VydFlUQVBJOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnNldFNldHRpbmdzKCAnaXNJbnNlcnRlZCcsIHRydWUgKTtcblxuXHRcdHRoaXMuZWxlbWVudHMuJGZpcnN0U2NyaXB0LmJlZm9yZSggalF1ZXJ5KCAnPHNjcmlwdD4nLCB7IHNyYzogdGhpcy5nZXRTZXR0aW5ncyggJ0FQSVNyYycgKSB9ICkgKTtcblx0fSxcblxuXHRvbllvdXR1YmVBcGlSZWFkeTogZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdGlmICggISBzZWxmLmdldFNldHRpbmdzKCAnSXNJbnNlcnRlZCcgKSApIHtcblx0XHRcdHNlbGYuaW5zZXJ0WVRBUEkoKTtcblx0XHR9XG5cblx0XHRpZiAoIHdpbmRvdy5ZVCAmJiBZVC5sb2FkZWQgKSB7XG5cdFx0XHRjYWxsYmFjayggWVQgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gSWYgbm90IHJlYWR5IGNoZWNrIGFnYWluIGJ5IHRpbWVvdXQuLlxuXHRcdFx0c2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHNlbGYub25Zb3V0dWJlQXBpUmVhZHkoIGNhbGxiYWNrICk7XG5cdFx0XHR9LCAzNTAgKTtcblx0XHR9XG5cdH0sXG5cblx0Z2V0WW91dHViZUlERnJvbVVSTDogZnVuY3Rpb24oIHVybCApIHtcblx0XHR2YXIgdmlkZW9JRFBhcnRzID0gdXJsLm1hdGNoKCAvXig/Omh0dHBzPzpcXC9cXC8pPyg/Ond3d1xcLik/KD86bVxcLik/KD86eW91dHVcXC5iZVxcL3x5b3V0dWJlXFwuY29tXFwvKD86KD86d2F0Y2gpP1xcPyg/Oi4qJik/dmk/PXwoPzplbWJlZHx2fHZpfHVzZXIpXFwvKSkoW14/JlwiJz5dKykvICk7XG5cblx0XHRyZXR1cm4gdmlkZW9JRFBhcnRzICYmIHZpZGVvSURQYXJ0c1sxXTtcblx0fVxufSApO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIEhhbmRsZXMgbWFuYWdpbmcgYWxsIGV2ZW50cyBmb3Igd2hhdGV2ZXIgeW91IHBsdWcgaXQgaW50by4gUHJpb3JpdGllcyBmb3IgaG9va3MgYXJlIGJhc2VkIG9uIGxvd2VzdCB0byBoaWdoZXN0IGluXG4gKiB0aGF0LCBsb3dlc3QgcHJpb3JpdHkgaG9va3MgYXJlIGZpcmVkIGZpcnN0LlxuICovXG52YXIgRXZlbnRNYW5hZ2VyID0gZnVuY3Rpb24oKSB7XG5cdHZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZSxcblx0XHRNZXRob2RzQXZhaWxhYmxlO1xuXG5cdC8qKlxuXHQgKiBDb250YWlucyB0aGUgaG9va3MgdGhhdCBnZXQgcmVnaXN0ZXJlZCB3aXRoIHRoaXMgRXZlbnRNYW5hZ2VyLiBUaGUgYXJyYXkgZm9yIHN0b3JhZ2UgdXRpbGl6ZXMgYSBcImZsYXRcIlxuXHQgKiBvYmplY3QgbGl0ZXJhbCBzdWNoIHRoYXQgbG9va2luZyB1cCB0aGUgaG9vayB1dGlsaXplcyB0aGUgbmF0aXZlIG9iamVjdCBsaXRlcmFsIGhhc2guXG5cdCAqL1xuXHR2YXIgU1RPUkFHRSA9IHtcblx0XHRhY3Rpb25zOiB7fSxcblx0XHRmaWx0ZXJzOiB7fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIHRoZSBzcGVjaWZpZWQgaG9vayBieSByZXNldHRpbmcgdGhlIHZhbHVlIG9mIGl0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdHlwZSBUeXBlIG9mIGhvb2ssIGVpdGhlciAnYWN0aW9ucycgb3IgJ2ZpbHRlcnMnXG5cdCAqIEBwYXJhbSBob29rIFRoZSBob29rIChuYW1lc3BhY2UuaWRlbnRpZmllcikgdG8gcmVtb3ZlXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRmdW5jdGlvbiBfcmVtb3ZlSG9vayggdHlwZSwgaG9vaywgY2FsbGJhY2ssIGNvbnRleHQgKSB7XG5cdFx0dmFyIGhhbmRsZXJzLCBoYW5kbGVyLCBpO1xuXG5cdFx0aWYgKCAhIFNUT1JBR0VbIHR5cGUgXVsgaG9vayBdICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoICEgY2FsbGJhY2sgKSB7XG5cdFx0XHRTVE9SQUdFWyB0eXBlIF1bIGhvb2sgXSA9IFtdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRoYW5kbGVycyA9IFNUT1JBR0VbIHR5cGUgXVsgaG9vayBdO1xuXHRcdFx0aWYgKCAhIGNvbnRleHQgKSB7XG5cdFx0XHRcdGZvciAoIGkgPSBoYW5kbGVycy5sZW5ndGg7IGktLTsgKSB7XG5cdFx0XHRcdFx0aWYgKCBoYW5kbGVyc1sgaSBdLmNhbGxiYWNrID09PSBjYWxsYmFjayApIHtcblx0XHRcdFx0XHRcdGhhbmRsZXJzLnNwbGljZSggaSwgMSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Zm9yICggaSA9IGhhbmRsZXJzLmxlbmd0aDsgaS0tOyApIHtcblx0XHRcdFx0XHRoYW5kbGVyID0gaGFuZGxlcnNbIGkgXTtcblx0XHRcdFx0XHRpZiAoIGhhbmRsZXIuY2FsbGJhY2sgPT09IGNhbGxiYWNrICYmIGhhbmRsZXIuY29udGV4dCA9PT0gY29udGV4dCApIHtcblx0XHRcdFx0XHRcdGhhbmRsZXJzLnNwbGljZSggaSwgMSApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBVc2UgYW4gaW5zZXJ0IHNvcnQgZm9yIGtlZXBpbmcgb3VyIGhvb2tzIG9yZ2FuaXplZCBiYXNlZCBvbiBwcmlvcml0eS4gVGhpcyBmdW5jdGlvbiBpcyByaWRpY3Vsb3VzbHkgZmFzdGVyXG5cdCAqIHRoYW4gYnViYmxlIHNvcnQsIGV0YzogaHR0cDovL2pzcGVyZi5jb20vamF2YXNjcmlwdC1zb3J0XG5cdCAqXG5cdCAqIEBwYXJhbSBob29rcyBUaGUgY3VzdG9tIGFycmF5IGNvbnRhaW5pbmcgYWxsIG9mIHRoZSBhcHByb3ByaWF0ZSBob29rcyB0byBwZXJmb3JtIGFuIGluc2VydCBzb3J0IG9uLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX2hvb2tJbnNlcnRTb3J0KCBob29rcyApIHtcblx0XHR2YXIgdG1wSG9vaywgaiwgcHJldkhvb2s7XG5cdFx0Zm9yICggdmFyIGkgPSAxLCBsZW4gPSBob29rcy5sZW5ndGg7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdHRtcEhvb2sgPSBob29rc1sgaSBdO1xuXHRcdFx0aiA9IGk7XG5cdFx0XHR3aGlsZSAoICggcHJldkhvb2sgPSBob29rc1sgaiAtIDEgXSApICYmIHByZXZIb29rLnByaW9yaXR5ID4gdG1wSG9vay5wcmlvcml0eSApIHtcblx0XHRcdFx0aG9va3NbIGogXSA9IGhvb2tzWyBqIC0gMSBdO1xuXHRcdFx0XHQtLWo7XG5cdFx0XHR9XG5cdFx0XHRob29rc1sgaiBdID0gdG1wSG9vaztcblx0XHR9XG5cblx0XHRyZXR1cm4gaG9va3M7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyB0aGUgaG9vayB0byB0aGUgYXBwcm9wcmlhdGUgc3RvcmFnZSBjb250YWluZXJcblx0ICpcblx0ICogQHBhcmFtIHR5cGUgJ2FjdGlvbnMnIG9yICdmaWx0ZXJzJ1xuXHQgKiBAcGFyYW0gaG9vayBUaGUgaG9vayAobmFtZXNwYWNlLmlkZW50aWZpZXIpIHRvIGFkZCB0byBvdXIgZXZlbnQgbWFuYWdlclxuXHQgKiBAcGFyYW0gY2FsbGJhY2sgVGhlIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgaG9vayBpcyBleGVjdXRlZC5cblx0ICogQHBhcmFtIHByaW9yaXR5IFRoZSBwcmlvcml0eSBvZiB0aGlzIGhvb2suIE11c3QgYmUgYW4gaW50ZWdlci5cblx0ICogQHBhcmFtIFtjb250ZXh0XSBBIHZhbHVlIHRvIGJlIHVzZWQgZm9yIHRoaXNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGZ1bmN0aW9uIF9hZGRIb29rKCB0eXBlLCBob29rLCBjYWxsYmFjaywgcHJpb3JpdHksIGNvbnRleHQgKSB7XG5cdFx0dmFyIGhvb2tPYmplY3QgPSB7XG5cdFx0XHRjYWxsYmFjazogY2FsbGJhY2ssXG5cdFx0XHRwcmlvcml0eTogcHJpb3JpdHksXG5cdFx0XHRjb250ZXh0OiBjb250ZXh0XG5cdFx0fTtcblxuXHRcdC8vIFV0aWxpemUgJ3Byb3AgaXRzZWxmJyA6IGh0dHA6Ly9qc3BlcmYuY29tL2hhc293bnByb3BlcnR5LXZzLWluLXZzLXVuZGVmaW5lZC8xOVxuXHRcdHZhciBob29rcyA9IFNUT1JBR0VbIHR5cGUgXVsgaG9vayBdO1xuXHRcdGlmICggaG9va3MgKSB7XG5cdFx0XHQvLyBURU1QIEZJWCBCVUdcblx0XHRcdHZhciBoYXNTYW1lQ2FsbGJhY2sgPSBmYWxzZTtcblx0XHRcdGpRdWVyeS5lYWNoKCBob29rcywgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggdGhpcy5jYWxsYmFjayA9PT0gY2FsbGJhY2sgKSB7XG5cdFx0XHRcdFx0aGFzU2FtZUNhbGxiYWNrID0gdHJ1ZTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gKTtcblxuXHRcdFx0aWYgKCBoYXNTYW1lQ2FsbGJhY2sgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdC8vIEVORCBURU1QIEZJWCBCVUdcblxuXHRcdFx0aG9va3MucHVzaCggaG9va09iamVjdCApO1xuXHRcdFx0aG9va3MgPSBfaG9va0luc2VydFNvcnQoIGhvb2tzICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGhvb2tzID0gWyBob29rT2JqZWN0IF07XG5cdFx0fVxuXG5cdFx0U1RPUkFHRVsgdHlwZSBdWyBob29rIF0gPSBob29rcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSdW5zIHRoZSBzcGVjaWZpZWQgaG9vay4gSWYgaXQgaXMgYW4gYWN0aW9uLCB0aGUgdmFsdWUgaXMgbm90IG1vZGlmaWVkIGJ1dCBpZiBpdCBpcyBhIGZpbHRlciwgaXQgaXMuXG5cdCAqXG5cdCAqIEBwYXJhbSB0eXBlICdhY3Rpb25zJyBvciAnZmlsdGVycydcblx0ICogQHBhcmFtIGhvb2sgVGhlIGhvb2sgKCBuYW1lc3BhY2UuaWRlbnRpZmllciApIHRvIGJlIHJhbi5cblx0ICogQHBhcmFtIGFyZ3MgQXJndW1lbnRzIHRvIHBhc3MgdG8gdGhlIGFjdGlvbi9maWx0ZXIuIElmIGl0J3MgYSBmaWx0ZXIsIGFyZ3MgaXMgYWN0dWFsbHkgYSBzaW5nbGUgcGFyYW1ldGVyLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0ZnVuY3Rpb24gX3J1bkhvb2soIHR5cGUsIGhvb2ssIGFyZ3MgKSB7XG5cdFx0dmFyIGhhbmRsZXJzID0gU1RPUkFHRVsgdHlwZSBdWyBob29rIF0sIGksIGxlbjtcblxuXHRcdGlmICggISBoYW5kbGVycyApIHtcblx0XHRcdHJldHVybiAoICdmaWx0ZXJzJyA9PT0gdHlwZSApID8gYXJnc1sgMCBdIDogZmFsc2U7XG5cdFx0fVxuXG5cdFx0bGVuID0gaGFuZGxlcnMubGVuZ3RoO1xuXHRcdGlmICggJ2ZpbHRlcnMnID09PSB0eXBlICkge1xuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW47IGkrKyApIHtcblx0XHRcdFx0YXJnc1sgMCBdID0gaGFuZGxlcnNbIGkgXS5jYWxsYmFjay5hcHBseSggaGFuZGxlcnNbIGkgXS5jb250ZXh0LCBhcmdzICk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoIGkgPSAwOyBpIDwgbGVuOyBpKysgKSB7XG5cdFx0XHRcdGhhbmRsZXJzWyBpIF0uY2FsbGJhY2suYXBwbHkoIGhhbmRsZXJzWyBpIF0uY29udGV4dCwgYXJncyApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAoICdmaWx0ZXJzJyA9PT0gdHlwZSApID8gYXJnc1sgMCBdIDogdHJ1ZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGFjdGlvbiB0byB0aGUgZXZlbnQgbWFuYWdlci5cblx0ICpcblx0ICogQHBhcmFtIGFjdGlvbiBNdXN0IGNvbnRhaW4gbmFtZXNwYWNlLmlkZW50aWZpZXJcblx0ICogQHBhcmFtIGNhbGxiYWNrIE11c3QgYmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgdGhpcyBhY3Rpb24gaXMgYWRkZWRcblx0ICogQHBhcmFtIFtwcmlvcml0eT0xMF0gVXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGluIHJlbGF0aW9uIHRvIG90aGVyIGNhbGxiYWNrcyBib3VuZCB0byB0aGUgc2FtZSBob29rXG5cdCAqIEBwYXJhbSBbY29udGV4dF0gU3VwcGx5IGEgdmFsdWUgdG8gYmUgdXNlZCBmb3IgdGhpc1xuXHQgKi9cblx0ZnVuY3Rpb24gYWRkQWN0aW9uKCBhY3Rpb24sIGNhbGxiYWNrLCBwcmlvcml0eSwgY29udGV4dCApIHtcblx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgYWN0aW9uICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBjYWxsYmFjayApIHtcblx0XHRcdHByaW9yaXR5ID0gcGFyc2VJbnQoICggcHJpb3JpdHkgfHwgMTAgKSwgMTAgKTtcblx0XHRcdF9hZGRIb29rKCAnYWN0aW9ucycsIGFjdGlvbiwgY2FsbGJhY2ssIHByaW9yaXR5LCBjb250ZXh0ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1ldGhvZHNBdmFpbGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogUGVyZm9ybXMgYW4gYWN0aW9uIGlmIGl0IGV4aXN0cy4gWW91IGNhbiBwYXNzIGFzIG1hbnkgYXJndW1lbnRzIGFzIHlvdSB3YW50IHRvIHRoaXMgZnVuY3Rpb247IHRoZSBvbmx5IHJ1bGUgaXNcblx0ICogdGhhdCB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBhbHdheXMgYmUgdGhlIGFjdGlvbi5cblx0ICovXG5cdGZ1bmN0aW9uIGRvQWN0aW9uKCAvKiBhY3Rpb24sIGFyZzEsIGFyZzIsIC4uLiAqLyApIHtcblx0XHR2YXIgYXJncyA9IHNsaWNlLmNhbGwoIGFyZ3VtZW50cyApO1xuXHRcdHZhciBhY3Rpb24gPSBhcmdzLnNoaWZ0KCk7XG5cblx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgYWN0aW9uICkge1xuXHRcdFx0X3J1bkhvb2soICdhY3Rpb25zJywgYWN0aW9uLCBhcmdzICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1ldGhvZHNBdmFpbGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyB0aGUgc3BlY2lmaWVkIGFjdGlvbiBpZiBpdCBjb250YWlucyBhIG5hbWVzcGFjZS5pZGVudGlmaWVyICYgZXhpc3RzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYWN0aW9uIFRoZSBhY3Rpb24gdG8gcmVtb3ZlXG5cdCAqIEBwYXJhbSBbY2FsbGJhY2tdIENhbGxiYWNrIGZ1bmN0aW9uIHRvIHJlbW92ZVxuXHQgKi9cblx0ZnVuY3Rpb24gcmVtb3ZlQWN0aW9uKCBhY3Rpb24sIGNhbGxiYWNrICkge1xuXHRcdGlmICggJ3N0cmluZycgPT09IHR5cGVvZiBhY3Rpb24gKSB7XG5cdFx0XHRfcmVtb3ZlSG9vayggJ2FjdGlvbnMnLCBhY3Rpb24sIGNhbGxiYWNrICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1ldGhvZHNBdmFpbGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIGZpbHRlciB0byB0aGUgZXZlbnQgbWFuYWdlci5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlciBNdXN0IGNvbnRhaW4gbmFtZXNwYWNlLmlkZW50aWZpZXJcblx0ICogQHBhcmFtIGNhbGxiYWNrIE11c3QgYmUgYSB2YWxpZCBjYWxsYmFjayBmdW5jdGlvbiBiZWZvcmUgdGhpcyBhY3Rpb24gaXMgYWRkZWRcblx0ICogQHBhcmFtIFtwcmlvcml0eT0xMF0gVXNlZCB0byBjb250cm9sIHdoZW4gdGhlIGZ1bmN0aW9uIGlzIGV4ZWN1dGVkIGluIHJlbGF0aW9uIHRvIG90aGVyIGNhbGxiYWNrcyBib3VuZCB0byB0aGUgc2FtZSBob29rXG5cdCAqIEBwYXJhbSBbY29udGV4dF0gU3VwcGx5IGEgdmFsdWUgdG8gYmUgdXNlZCBmb3IgdGhpc1xuXHQgKi9cblx0ZnVuY3Rpb24gYWRkRmlsdGVyKCBmaWx0ZXIsIGNhbGxiYWNrLCBwcmlvcml0eSwgY29udGV4dCApIHtcblx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgZmlsdGVyICYmICdmdW5jdGlvbicgPT09IHR5cGVvZiBjYWxsYmFjayApIHtcblx0XHRcdHByaW9yaXR5ID0gcGFyc2VJbnQoICggcHJpb3JpdHkgfHwgMTAgKSwgMTAgKTtcblx0XHRcdF9hZGRIb29rKCAnZmlsdGVycycsIGZpbHRlciwgY2FsbGJhY2ssIHByaW9yaXR5LCBjb250ZXh0ICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIE1ldGhvZHNBdmFpbGFibGU7XG5cdH1cblxuXHQvKipcblx0ICogUGVyZm9ybXMgYSBmaWx0ZXIgaWYgaXQgZXhpc3RzLiBZb3Ugc2hvdWxkIG9ubHkgZXZlciBwYXNzIDEgYXJndW1lbnQgdG8gYmUgZmlsdGVyZWQuIFRoZSBvbmx5IHJ1bGUgaXMgdGhhdFxuXHQgKiB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBhbHdheXMgYmUgdGhlIGZpbHRlci5cblx0ICovXG5cdGZ1bmN0aW9uIGFwcGx5RmlsdGVycyggLyogZmlsdGVyLCBmaWx0ZXJlZCBhcmcsIGFyZzIsIC4uLiAqLyApIHtcblx0XHR2YXIgYXJncyA9IHNsaWNlLmNhbGwoIGFyZ3VtZW50cyApO1xuXHRcdHZhciBmaWx0ZXIgPSBhcmdzLnNoaWZ0KCk7XG5cblx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgZmlsdGVyICkge1xuXHRcdFx0cmV0dXJuIF9ydW5Ib29rKCAnZmlsdGVycycsIGZpbHRlciwgYXJncyApO1xuXHRcdH1cblxuXHRcdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBmaWx0ZXIgaWYgaXQgY29udGFpbnMgYSBuYW1lc3BhY2UuaWRlbnRpZmllciAmIGV4aXN0cy5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlciBUaGUgYWN0aW9uIHRvIHJlbW92ZVxuXHQgKiBAcGFyYW0gW2NhbGxiYWNrXSBDYWxsYmFjayBmdW5jdGlvbiB0byByZW1vdmVcblx0ICovXG5cdGZ1bmN0aW9uIHJlbW92ZUZpbHRlciggZmlsdGVyLCBjYWxsYmFjayApIHtcblx0XHRpZiAoICdzdHJpbmcnID09PSB0eXBlb2YgZmlsdGVyICkge1xuXHRcdFx0X3JlbW92ZUhvb2soICdmaWx0ZXJzJywgZmlsdGVyLCBjYWxsYmFjayApO1xuXHRcdH1cblxuXHRcdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xuXHR9XG5cblx0LyoqXG5cdCAqIE1haW50YWluIGEgcmVmZXJlbmNlIHRvIHRoZSBvYmplY3Qgc2NvcGUgc28gb3VyIHB1YmxpYyBtZXRob2RzIG5ldmVyIGdldCBjb25mdXNpbmcuXG5cdCAqL1xuXHRNZXRob2RzQXZhaWxhYmxlID0ge1xuXHRcdHJlbW92ZUZpbHRlcjogcmVtb3ZlRmlsdGVyLFxuXHRcdGFwcGx5RmlsdGVyczogYXBwbHlGaWx0ZXJzLFxuXHRcdGFkZEZpbHRlcjogYWRkRmlsdGVyLFxuXHRcdHJlbW92ZUFjdGlvbjogcmVtb3ZlQWN0aW9uLFxuXHRcdGRvQWN0aW9uOiBkb0FjdGlvbixcblx0XHRhZGRBY3Rpb246IGFkZEFjdGlvblxuXHR9O1xuXG5cdC8vIHJldHVybiBhbGwgb2YgdGhlIHB1YmxpY2x5IGF2YWlsYWJsZSBtZXRob2RzXG5cdHJldHVybiBNZXRob2RzQXZhaWxhYmxlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBFdmVudE1hbmFnZXI7XG4iLCJ2YXIgSG90S2V5cyA9IGZ1bmN0aW9uKCkge1xuXHR2YXIgaG90S2V5c0hhbmRsZXJzID0gdGhpcy5ob3RLZXlzSGFuZGxlcnMgPSB7fTtcblxuXHR2YXIgaXNNYWMgPSBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gLTEgIT09IG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZiggJ01hYyBPUyBYJyApO1xuXHR9O1xuXG5cdHZhciBhcHBseUhvdEtleSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgaGFuZGxlcnMgPSBob3RLZXlzSGFuZGxlcnNbIGV2ZW50LndoaWNoIF07XG5cblx0XHRpZiAoICEgaGFuZGxlcnMgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0alF1ZXJ5LmVhY2goIGhhbmRsZXJzLCBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBoYW5kbGVyID0gdGhpcztcblxuXHRcdFx0aWYgKCBoYW5kbGVyLmlzV29ydGhIYW5kbGluZyAmJiAhIGhhbmRsZXIuaXNXb3J0aEhhbmRsaW5nKCBldmVudCApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIEZpeCBmb3Igc29tZSBrZXlib2FyZCBzb3VyY2VzIHRoYXQgY29uc2lkZXIgYWx0IGtleSBhcyBjdHJsIGtleVxuXHRcdFx0aWYgKCAhIGhhbmRsZXIuYWxsb3dBbHRLZXkgJiYgZXZlbnQuYWx0S2V5ICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGhhbmRsZXIuaGFuZGxlKCBldmVudCApO1xuXHRcdH0gKTtcblx0fTtcblxuXHR0aGlzLmlzQ29udHJvbEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHJldHVybiBldmVudFsgaXNNYWMoKSA/ICdtZXRhS2V5JyA6ICdjdHJsS2V5JyBdO1xuXHR9O1xuXG5cdHRoaXMuYWRkSG90S2V5SGFuZGxlciA9IGZ1bmN0aW9uKCBrZXlDb2RlLCBoYW5kbGVyTmFtZSwgaGFuZGxlciApIHtcblx0XHRpZiAoICEgaG90S2V5c0hhbmRsZXJzWyBrZXlDb2RlIF0gKSB7XG5cdFx0XHRob3RLZXlzSGFuZGxlcnNbIGtleUNvZGUgXSA9IHt9O1xuXHRcdH1cblxuXHRcdGhvdEtleXNIYW5kbGVyc1sga2V5Q29kZSBdWyBoYW5kbGVyTmFtZSBdID0gaGFuZGxlcjtcblx0fTtcblxuXHR0aGlzLmJpbmRMaXN0ZW5lciA9IGZ1bmN0aW9uKCAkbGlzdGVuZXIgKSB7XG5cdFx0JGxpc3RlbmVyLm9uKCAna2V5ZG93bicsIGFwcGx5SG90S2V5ICk7XG5cdH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBIb3RLZXlzKCk7XG4iLCJ2YXIgTW9kdWxlID0gZnVuY3Rpb24oKSB7XG5cdHZhciAkID0galF1ZXJ5LFxuXHRcdGluc3RhbmNlUGFyYW1zID0gYXJndW1lbnRzLFxuXHRcdHNlbGYgPSB0aGlzLFxuXHRcdHNldHRpbmdzLFxuXHRcdGV2ZW50cyA9IHt9O1xuXG5cdHZhciBlbnN1cmVDbG9zdXJlTWV0aG9kcyA9IGZ1bmN0aW9uKCkge1xuXHRcdCQuZWFjaCggc2VsZiwgZnVuY3Rpb24oIG1ldGhvZE5hbWUgKSB7XG5cdFx0XHR2YXIgb2xkTWV0aG9kID0gc2VsZlsgbWV0aG9kTmFtZSBdO1xuXG5cdFx0XHRpZiAoICdmdW5jdGlvbicgIT09IHR5cGVvZiBvbGRNZXRob2QgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c2VsZlsgbWV0aG9kTmFtZSBdID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHJldHVybiBvbGRNZXRob2QuYXBwbHkoIHNlbGYsIGFyZ3VtZW50cyApO1xuXHRcdFx0fTtcblx0XHR9KTtcblx0fTtcblxuXHR2YXIgaW5pdFNldHRpbmdzID0gZnVuY3Rpb24oKSB7XG5cdFx0c2V0dGluZ3MgPSBzZWxmLmdldERlZmF1bHRTZXR0aW5ncygpO1xuXG5cdFx0dmFyIGluc3RhbmNlU2V0dGluZ3MgPSBpbnN0YW5jZVBhcmFtc1swXTtcblxuXHRcdGlmICggaW5zdGFuY2VTZXR0aW5ncyApIHtcblx0XHRcdCQuZXh0ZW5kKCBzZXR0aW5ncywgaW5zdGFuY2VTZXR0aW5ncyApO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgaW5pdCA9IGZ1bmN0aW9uKCkge1xuXHRcdHNlbGYuX19jb25zdHJ1Y3QuYXBwbHkoIHNlbGYsIGluc3RhbmNlUGFyYW1zICk7XG5cblx0XHRlbnN1cmVDbG9zdXJlTWV0aG9kcygpO1xuXG5cdFx0aW5pdFNldHRpbmdzKCk7XG5cblx0XHRzZWxmLnRyaWdnZXIoICdpbml0JyApO1xuXHR9O1xuXG5cdHRoaXMuZ2V0SXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGl0ZW1LZXkgKSB7XG5cdFx0aWYgKCBpdGVtS2V5ICkge1xuXHRcdFx0dmFyIGtleVN0YWNrID0gaXRlbUtleS5zcGxpdCggJy4nICksXG5cdFx0XHRcdGN1cnJlbnRLZXkgPSBrZXlTdGFjay5zcGxpY2UoIDAsIDEgKTtcblxuXHRcdFx0aWYgKCAhIGtleVN0YWNrLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuIGl0ZW1zWyBjdXJyZW50S2V5IF07XG5cdFx0XHR9XG5cblx0XHRcdGlmICggISBpdGVtc1sgY3VycmVudEtleSBdICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLmdldEl0ZW1zKCAgaXRlbXNbIGN1cnJlbnRLZXkgXSwga2V5U3RhY2suam9pbiggJy4nICkgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gaXRlbXM7XG5cdH07XG5cblx0dGhpcy5nZXRTZXR0aW5ncyA9IGZ1bmN0aW9uKCBzZXR0aW5nICkge1xuXHRcdHJldHVybiB0aGlzLmdldEl0ZW1zKCBzZXR0aW5ncywgc2V0dGluZyApO1xuXHR9O1xuXG5cdHRoaXMuc2V0U2V0dGluZ3MgPSBmdW5jdGlvbiggc2V0dGluZ0tleSwgdmFsdWUsIHNldHRpbmdzQ29udGFpbmVyICkge1xuXHRcdGlmICggISBzZXR0aW5nc0NvbnRhaW5lciApIHtcblx0XHRcdHNldHRpbmdzQ29udGFpbmVyID0gc2V0dGluZ3M7XG5cdFx0fVxuXG5cdFx0aWYgKCAnb2JqZWN0JyA9PT0gdHlwZW9mIHNldHRpbmdLZXkgKSB7XG5cdFx0XHQkLmV4dGVuZCggc2V0dGluZ3NDb250YWluZXIsIHNldHRpbmdLZXkgKTtcblxuXHRcdFx0cmV0dXJuIHNlbGY7XG5cdFx0fVxuXG5cdFx0dmFyIGtleVN0YWNrID0gc2V0dGluZ0tleS5zcGxpdCggJy4nICksXG5cdFx0XHRjdXJyZW50S2V5ID0ga2V5U3RhY2suc3BsaWNlKCAwLCAxICk7XG5cblx0XHRpZiAoICEga2V5U3RhY2subGVuZ3RoICkge1xuXHRcdFx0c2V0dGluZ3NDb250YWluZXJbIGN1cnJlbnRLZXkgXSA9IHZhbHVlO1xuXG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9XG5cblx0XHRpZiAoICEgc2V0dGluZ3NDb250YWluZXJbIGN1cnJlbnRLZXkgXSApIHtcblx0XHRcdHNldHRpbmdzQ29udGFpbmVyWyBjdXJyZW50S2V5IF0gPSB7fTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc2VsZi5zZXRTZXR0aW5ncygga2V5U3RhY2suam9pbiggJy4nICksIHZhbHVlLCBzZXR0aW5nc0NvbnRhaW5lclsgY3VycmVudEtleSBdICk7XG5cdH07XG5cblx0dGhpcy5mb3JjZU1ldGhvZEltcGxlbWVudGF0aW9uID0gZnVuY3Rpb24oIG1ldGhvZEFyZ3VtZW50cyApIHtcblx0XHR2YXIgZnVuY3Rpb25OYW1lID0gbWV0aG9kQXJndW1lbnRzLmNhbGxlZS5uYW1lO1xuXG5cdFx0dGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKCAnVGhlIG1ldGhvZCAnICsgZnVuY3Rpb25OYW1lICsgJyBtdXN0IHRvIGJlIGltcGxlbWVudGVkIGluIHRoZSBpbmhlcml0b3IgY2hpbGQuJyApO1xuXHR9O1xuXG5cdHRoaXMub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBjYWxsYmFjayApIHtcblx0XHRpZiAoICdvYmplY3QnID09PSB0eXBlb2YgZXZlbnROYW1lICkge1xuXHRcdFx0JC5lYWNoKCBldmVudE5hbWUsIGZ1bmN0aW9uKCBzaW5nbGVFdmVudE5hbWUgKSB7XG5cdFx0XHRcdHNlbGYub24oIHNpbmdsZUV2ZW50TmFtZSwgdGhpcyApO1xuXHRcdFx0fSApO1xuXG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9XG5cblx0XHR2YXIgZXZlbnROYW1lcyA9IGV2ZW50TmFtZS5zcGxpdCggJyAnICk7XG5cblx0XHRldmVudE5hbWVzLmZvckVhY2goIGZ1bmN0aW9uKCBzaW5nbGVFdmVudE5hbWUgKSB7XG5cdFx0XHRpZiAoICEgZXZlbnRzWyBzaW5nbGVFdmVudE5hbWUgXSApIHtcblx0XHRcdFx0ZXZlbnRzWyBzaW5nbGVFdmVudE5hbWUgXSA9IFtdO1xuXHRcdFx0fVxuXG5cdFx0XHRldmVudHNbIHNpbmdsZUV2ZW50TmFtZSBdLnB1c2goIGNhbGxiYWNrICk7XG5cdFx0fSApO1xuXG5cdFx0cmV0dXJuIHNlbGY7XG5cdH07XG5cblx0dGhpcy5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBjYWxsYmFjayApIHtcblx0XHRpZiAoICEgZXZlbnRzWyBldmVudE5hbWUgXSApIHtcblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblxuXHRcdGlmICggISBjYWxsYmFjayApIHtcblx0XHRcdGRlbGV0ZSBldmVudHNbIGV2ZW50TmFtZSBdO1xuXG5cdFx0XHRyZXR1cm4gc2VsZjtcblx0XHR9XG5cblx0XHR2YXIgY2FsbGJhY2tJbmRleCA9IGV2ZW50c1sgZXZlbnROYW1lIF0uaW5kZXhPZiggY2FsbGJhY2sgKTtcblxuXHRcdGlmICggLTEgIT09IGNhbGxiYWNrSW5kZXggKSB7XG5cdFx0XHRkZWxldGUgZXZlbnRzWyBldmVudE5hbWUgXVsgY2FsbGJhY2tJbmRleCBdO1xuXHRcdH1cblxuXHRcdHJldHVybiBzZWxmO1xuXHR9O1xuXG5cdHRoaXMudHJpZ2dlciA9IGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG5cdFx0dmFyIG1ldGhvZE5hbWUgPSAnb24nICsgZXZlbnROYW1lWyAwIF0udG9VcHBlckNhc2UoKSArIGV2ZW50TmFtZS5zbGljZSggMSApLFxuXHRcdFx0cGFyYW1zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXG5cdFx0aWYgKCBzZWxmWyBtZXRob2ROYW1lIF0gKSB7XG5cdFx0XHRzZWxmWyBtZXRob2ROYW1lIF0uYXBwbHkoIHNlbGYsIHBhcmFtcyApO1xuXHRcdH1cblxuXHRcdHZhciBjYWxsYmFja3MgPSBldmVudHNbIGV2ZW50TmFtZSBdO1xuXG5cdFx0aWYgKCAhIGNhbGxiYWNrcyApIHtcblx0XHRcdHJldHVybiBzZWxmO1xuXHRcdH1cblxuXHRcdCQuZWFjaCggY2FsbGJhY2tzLCBmdW5jdGlvbiggaW5kZXgsIGNhbGxiYWNrICkge1xuXHRcdFx0Y2FsbGJhY2suYXBwbHkoIHNlbGYsIHBhcmFtcyApO1xuXHRcdH0gKTtcblxuXHRcdHJldHVybiBzZWxmO1xuXHR9O1xuXG5cdGluaXQoKTtcbn07XG5cbk1vZHVsZS5wcm90b3R5cGUuX19jb25zdHJ1Y3QgPSBmdW5jdGlvbigpIHt9O1xuXG5Nb2R1bGUucHJvdG90eXBlLmdldERlZmF1bHRTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xuXHRyZXR1cm4ge307XG59O1xuXG5Nb2R1bGUuZXh0ZW5kc0NvdW50ID0gMDtcblxuTW9kdWxlLmV4dGVuZCA9IGZ1bmN0aW9uKCBwcm9wZXJ0aWVzICkge1xuXHR2YXIgJCA9IGpRdWVyeSxcblx0XHRwYXJlbnQgPSB0aGlzO1xuXG5cdHZhciBjaGlsZCA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBwYXJlbnQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9O1xuXG5cdCQuZXh0ZW5kKCBjaGlsZCwgcGFyZW50ICk7XG5cblx0Y2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggJC5leHRlbmQoIHt9LCBwYXJlbnQucHJvdG90eXBlLCBwcm9wZXJ0aWVzICkgKTtcblxuXHRjaGlsZC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjaGlsZDtcblxuXHQvKlxuXHQgKiBDb25zdHJ1Y3RvciBJRCBpcyB1c2VkIHRvIHNldCBhbiB1bmlxdWUgSURcbiAgICAgKiB0byBldmVyeSBleHRlbmQgb2YgdGhlIE1vZHVsZS5cbiAgICAgKlxuXHQgKiBJdCdzIHVzZWZ1bCBpbiBzb21lIGNhc2VzIHN1Y2ggYXMgdW5pcXVlXG5cdCAqIGxpc3RlbmVyIGZvciBmcm9udGVuZCBoYW5kbGVycy5cblx0ICovXG5cdHZhciBjb25zdHJ1Y3RvcklEID0gKytNb2R1bGUuZXh0ZW5kc0NvdW50O1xuXG5cdGNoaWxkLnByb3RvdHlwZS5nZXRDb25zdHJ1Y3RvcklEID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIGNvbnN0cnVjdG9ySUQ7XG5cdH07XG5cblx0Y2hpbGQuX19zdXBlcl9fID0gcGFyZW50LnByb3RvdHlwZTtcblxuXHRyZXR1cm4gY2hpbGQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vZHVsZTtcbiIsInZhciBNb2R1bGUgPSByZXF1aXJlKCAnLi9tb2R1bGUnICksXG5cdFZpZXdNb2R1bGU7XG5cblZpZXdNb2R1bGUgPSBNb2R1bGUuZXh0ZW5kKCB7XG5cdGVsZW1lbnRzOiBudWxsLFxuXG5cdGdldERlZmF1bHRFbGVtZW50czogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9LFxuXG5cdGJpbmRFdmVudHM6IGZ1bmN0aW9uKCkge30sXG5cblx0b25Jbml0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmluaXRFbGVtZW50cygpO1xuXG5cdFx0dGhpcy5iaW5kRXZlbnRzKCk7XG5cdH0sXG5cblx0aW5pdEVsZW1lbnRzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVsZW1lbnRzID0gdGhpcy5nZXREZWZhdWx0RWxlbWVudHMoKTtcblx0fVxufSApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXdNb2R1bGU7XG4iXX0=

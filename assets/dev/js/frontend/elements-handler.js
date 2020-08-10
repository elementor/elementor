import accordionHandler from './handlers/accordion';
import alertHandler from './handlers/alert';
import counterHandler from './handlers/counter';
import progressHandler from './handlers/progress';
import tabsHandler from './handlers/tabs';
import toggleHandler from './handlers/toggle';
import videoHandler from './handlers/video';
import imageCarouselHandler from './handlers/image-carousel';
import textEditorHandler from './handlers/text-editor';
import sectionHandler from './handlers/section/section';
import columnHandler from './handlers/column';
import globalHandler from './handlers/global';

module.exports = function( $ ) {
	const self = this;

	// element-type.skin-type
	const handlers = {
		// Elements
		section: sectionHandler,
		column: columnHandler,

		// Widgets
		'accordion.default': accordionHandler,
		'alert.default': alertHandler,
		'counter.default': counterHandler,
		'progress.default': progressHandler,
		'tabs.default': tabsHandler,
		'toggle.default': toggleHandler,
		'video.default': videoHandler,
		'image-carousel.default': imageCarouselHandler,
		'text-editor.default': textEditorHandler,
	};

	const handlersInstances = {};

	const addGlobalHandlers = function() {
		elementorFrontend.hooks.addAction( 'frontend/element_ready/global', globalHandler );
	};

	const addElementsHandlers = function() {
		$.each( handlers, function( elementName, funcCallback ) {
			elementorFrontend.hooks.addAction( 'frontend/element_ready/' + elementName, funcCallback );
		} );
	};

	const init = function() {
		self.initHandlers();
	};

	this.initHandlers = function() {
		addGlobalHandlers();

		addElementsHandlers();
	};

	this.addHandler = function( HandlerClass, options ) {
		const elementID = options.$element.data( 'model-cid' );

		let handlerID;

		// If element is in edit mode
		if ( elementID ) {
			handlerID = HandlerClass.prototype.getConstructorID();

			if ( ! handlersInstances[ elementID ] ) {
				handlersInstances[ elementID ] = {};
			}

			const oldHandler = handlersInstances[ elementID ][ handlerID ];

			if ( oldHandler ) {
				oldHandler.onDestroy();
			}
		}

		const newHandler = new HandlerClass( options );

		if ( elementID ) {
			handlersInstances[ elementID ][ handlerID ] = newHandler;
		}
	};

	this.getHandlers = function( handlerName ) {
		if ( handlerName ) {
			return handlers[ handlerName ];
		}

		return handlers;
	};

	this.runReadyTrigger = function( scope ) {
		if ( elementorFrontend.config.is_static ) {
			return;
		}

		// Initializing the `$scope` as frontend jQuery instance
		const $scope = jQuery( scope ),
			elementType = $scope.attr( 'data-element_type' );

		if ( ! elementType ) {
			return;
		}

		elementorFrontend.hooks.doAction( 'frontend/element_ready/global', $scope, $ );

		elementorFrontend.hooks.doAction( 'frontend/element_ready/' + elementType, $scope, $ );

		if ( 'widget' === elementType ) {
			elementorFrontend.hooks.doAction( 'frontend/element_ready/' + $scope.attr( 'data-widget_type' ), $scope, $ );
		}
	};

	init();
};

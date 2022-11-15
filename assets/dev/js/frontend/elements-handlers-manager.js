import globalHandler from './handlers/global';
import backgroundHandlers from './handlers/background';
import containerHandlers from './handlers/container/container';
import columnHandlers from './handlers/column';

// Section handlers.
import HandlesPosition from './handlers/section/handles-position';
import StretchedSection from './handlers/section/stretched-section';
import Shapes from './handlers/section/shapes';

module.exports = function( $ ) {
	const handlersInstances = {};

	this.elementsHandlers = {
		'accordion.default': () => import( /* webpackChunkName: 'accordion' */ './handlers/accordion' ),
		'alert.default': () => import( /* webpackChunkName: 'alert' */ './handlers/alert' ),
		'counter.default': () => import( /* webpackChunkName: 'counter' */ './handlers/counter' ),
		'progress.default': () => import( /* webpackChunkName: 'progress' */ './handlers/progress' ),
		'tabs.default': () => import( /* webpackChunkName: 'tabs' */ './handlers/tabs' ),
		'toggle.default': () => import( /* webpackChunkName: 'toggle' */ './handlers/toggle' ),
		'video.default': () => import( /* webpackChunkName: 'video' */ './handlers/video' ),
		'image-carousel.default': () => import( /* webpackChunkName: 'image-carousel' */ './handlers/image-carousel' ),
		'text-editor.default': () => import( /* webpackChunkName: 'text-editor' */ './handlers/text-editor' ),
		'wp-widget-media_audio.default': () => import( /* webpackChunkName: 'wp-audio' */ './handlers/wp-audio' ),
	};

	const addGlobalHandlers = () => elementorFrontend.hooks.addAction( 'frontend/element_ready/global', globalHandler );

	const addElementsHandlers = () => {
		this.elementsHandlers.section = [
			StretchedSection, // Must run before background handlers to init the slideshow only after the stretch.
			...backgroundHandlers,
			HandlesPosition,
			Shapes,
		];

		this.elementsHandlers.container = [ ...backgroundHandlers ];

		// Add editor-only handlers.
		if ( elementorFrontend.isEditMode() ) {
			this.elementsHandlers.container.push( ...containerHandlers );
		}

		this.elementsHandlers.column = columnHandlers;

		$.each( this.elementsHandlers, ( elementName, Handlers ) => {
			const elementData = elementName.split( '.' );

			elementName = elementData[ 0 ];

			const skin = elementData[ 1 ] || null;

			this.attachHandler( elementName, Handlers, skin );
		} );
	};

	const isClassHandler = ( Handler ) => Handler.prototype?.getUniqueHandlerID;

	const addHandlerWithHook = ( elementBaseName, Handler, skin = 'default' ) => {
		skin = skin ? '.' + skin : '';

		const elementName = elementBaseName + skin;

		elementorFrontend.hooks.addAction( `frontend/element_ready/${ elementName }`, ( $element ) => {
			if ( isClassHandler( Handler ) ) {
				this.addHandler( Handler, { $element, elementName }, true );
			} else {
				const handlerValue = Handler();

				if ( ! handlerValue ) {
					return;
				}

				if ( handlerValue instanceof Promise ) {
					handlerValue.then( ( { default: dynamicHandler } ) => {
						this.addHandler( dynamicHandler, { $element, elementName }, true );
					} );
				} else {
					this.addHandler( handlerValue, { $element, elementName }, true );
				}
			}
		} );
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

		elementorFrontend.hooks.doAction( `frontend/element_handler_ready/${ options.elementName }`, options.$element, $ );

		if ( elementID ) {
			handlersInstances[ elementID ][ handlerID ] = newHandler;
		}
	};

	this.attachHandler = ( elementName, Handlers, skin ) => {
		if ( ! Array.isArray( Handlers ) ) {
			Handlers = [ Handlers ];
		}

		Handlers.forEach( ( Handler ) => addHandlerWithHook( elementName, Handler, skin ) );
	};

	this.getHandler = function( handlerName ) {
		const elementHandler = this.elementsHandlers[ handlerName ];

		if ( isClassHandler( elementHandler ) ) {
			return elementHandler;
		}

		return new Promise( ( res ) => {
			elementHandler().then( ( { default: dynamicHandler } ) => {
				res( dynamicHandler );
			} );
		} );
	};

	this.getHandlers = function( handlerName ) {
		elementorDevTools.deprecation.deprecated( 'getHandlers', '3.1.0', 'elementorFrontend.elementsHandler.getHandler' );

		if ( handlerName ) {
			return this.getHandler( handlerName );
		}

		return this.elementsHandlers;
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

		elementorFrontend.hooks.doAction( `frontend/element_ready/${ elementType }`, $scope, $ );

		if ( 'widget' === elementType ) {
			const widgetType = $scope.attr( 'data-widget_type' );
			elementorFrontend.hooks.doAction( `frontend/element_ready/${ widgetType }`, $scope, $ );
		}
	};

	this.init = () => {
		addGlobalHandlers();

		addElementsHandlers();
	};
};

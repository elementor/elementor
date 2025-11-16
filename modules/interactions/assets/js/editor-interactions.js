/* eslint-disable no-unused-vars */

( function() {
	'use strict';

	const config = window.ElementorInteractionsConfig?.constants || {
		defaultDuration: 300,
		defaultDelay: 0,
		slideDistance: 100,
		scaleStart: 0.5,
		easing: 'linear',
	};

	function getKeyframes( effect, type, direction ) {
		const isIn = 'in' === type;
		const keyframes = {};

		keyframes.opacity = isIn ? [ 0, 1 ] : [ 1, 0 ];

		if ( 'scale' === effect ) {
			keyframes.scale = isIn ? [ config.scaleStart, 1 ] : [ 1, config.scaleStart ];
		}

		if ( direction ) {
			const distance = config.slideDistance;
			const movement = {
				left: { x: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
				right: { x: isIn ? [ distance, 0 ] : [ 0, distance ] },
				top: { y: isIn ? [ -distance, 0 ] : [ 0, -distance ] },
				bottom: { y: isIn ? [ distance, 0 ] : [ 0, distance ] },
			};

			Object.assign( keyframes, movement[ direction ] );
		}

		return keyframes;
	}

	function parseAnimationName( name ) {
		const [ trigger, effect, type, direction, duration, delay ] = name.split( '-' );

		return {
			trigger,
			effect,
			type,
			direction: direction || null,
			duration: duration ? parseInt( duration, 10 ) : config.defaultDuration,
			delay: delay ? parseInt( delay, 10 ) : config.defaultDelay,
		};
	}

	function applyAnimation( element, animConfig, animateFunc ) {
		const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction );
		const options = {
			duration: animConfig.duration / 1000,
			delay: animConfig.delay / 1000,
			easing: config.easing,
		};

		const initialKeyframes = {};
		Object.keys( keyframes ).forEach( ( key ) => {
			initialKeyframes[ key ] = keyframes[ key ][ 0 ];
		} );
		animateFunc( element, initialKeyframes, { duration: 0 } );

		animateFunc( element, keyframes, options );
	}

	function getInteractionsData() {
		const scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
		if ( ! scriptTag ) {
			return [];
		}

		try {
			return JSON.parse( scriptTag.textContent || '[]' );
		} catch {
			return [];
		}
	}

	function findElementByInteractionId( interactionId ) {
		return document.querySelector( '[data-interaction-id="' + interactionId + '"]' );
	}

	function applyInteractionsToElement( element, interactionsData ) {
		const animateFunc = 'undefined' !== typeof animate ? animate : window.Motion?.animate;

		if ( ! animateFunc ) {
			return;
		}

		let parsedData;
		try {
			parsedData = JSON.parse( interactionsData );
		} catch ( error ) {
			return;
		}

		const interactions = Object.values( parsedData?.items );

		interactions.forEach( ( interaction ) => {
			const animationName =
				'string' === typeof interaction
					? interaction
					: interaction?.animation?.animation_id;

			const animConfig = animationName && parseAnimationName( animationName );

			if ( animConfig ) {
				applyAnimation( element, animConfig, animateFunc );
			}
		} );
	}

	let previousInteractionsData = [];

	function handleInteractionsUpdate() {
		const currentInteractionsData = getInteractionsData();

		const changedItems = currentInteractionsData.filter( ( currentItem ) => {
			const previousItem = previousInteractionsData.find(
				( prev ) => prev.dataId === currentItem.dataId,
			);

			return ! previousItem || previousItem.interactions !== currentItem.interactions;
		} );

		changedItems.forEach( ( item ) => {
			const element = findElementByInteractionId( item.dataId );
			if ( element ) {
				applyInteractionsToElement( element, item.interactions );
			}
		} );

		previousInteractionsData = currentInteractionsData;
	}

	function initEditorInteractionsHandler() {
		if ( 'undefined' === typeof animate && ! window.Motion?.animate ) {
			setTimeout( initEditorInteractionsHandler, 100 );
			return;
		}

		const head = document.head;
		let scriptTag = null;
		let observer = null;

		function setupObserver( tag ) {
			if ( observer ) {
				observer.disconnect();
			}

			observer = new MutationObserver( () => {
				handleInteractionsUpdate();
			} );

			observer.observe( tag, {
				childList: true,
				characterData: true,
				subtree: true,
			} );

			handleInteractionsUpdate();
			registerWindowEvents();
		}

		const headObserver = new MutationObserver( () => {
			const foundScriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
			if ( foundScriptTag && foundScriptTag !== scriptTag ) {
				scriptTag = foundScriptTag;
				setupObserver( scriptTag );
				headObserver.disconnect();
			}
		} );

		headObserver.observe( head, {
			childList: true,
			subtree: true,
		} );

		scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
		if ( scriptTag ) {
			setupObserver( scriptTag );
			headObserver.disconnect();
		}
	}

	function registerWindowEvents() {
		window.top.addEventListener( 'atomic/play_interactions', handlePlayInteractions );
	}

	function handlePlayInteractions( event ) {
		const elementId = event.detail.elementId;
		const interactionsData = getInteractionsData();
		const item = interactionsData.find( ( elementItemData ) => elementItemData.dataId === elementId );
		if ( ! item ) {
			return;
		}
		const element = findElementByInteractionId( elementId );
		if ( element ) {
			applyInteractionsToElement( element, item.interactions );
		}
	}

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
	} else {
		initEditorInteractionsHandler();
	}
} )();


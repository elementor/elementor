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

	function findElementByDataId( dataId ) {
		const element = document.querySelector( '[data-id="' + dataId + '"]' );
		if ( ! element ) {
			const byId = document.getElementById( dataId );
			if ( byId ) {
				return byId;
			}
			const byClass = document.querySelector( '.elementor-element-' + dataId );
			if ( byClass ) {
				return byClass;
			}
		}
		return element;
	}

	function getAnimationTarget( element ) {
		// For atomic widgets, the data-id is on the wrapper, but we need to animate the actual content
		// Try to find the first meaningful child element (not just text nodes)
		if ( ! element ) {
			return null;
		}

		// If element has direct text content and no block children, animate the element itself
		const hasBlockChildren = Array.from( element.children ).some( ( child ) => {
			const style = window.getComputedStyle( child );
			return 'block' === style.display || 'flex' === style.display || 'grid' === style.display;
		} );

		const isContentElement = /^(h[1-6]|p|button|a|span|div)$/i.test( element.tagName );

		if ( isContentElement && ! hasBlockChildren ) {
			return element;
		}

		// Otherwise, try to find the first meaningful child
		// Look for direct child elements (not nested deeply)
		const firstChild = element.firstElementChild;
		if ( firstChild ) {
			// If first child is a link or button, use it
			if ( /^(a|button)$/i.test( firstChild.tagName ) ) {
				return firstChild;
			}
			// Otherwise use the first child element
			return firstChild;
		}

		// Fallback: animate the element itself
		return element;
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

		let interactions = [];

		if ( Array.isArray( parsedData ) ) {
			interactions = parsedData;
		} else if ( parsedData && 'object' === typeof parsedData && parsedData.items ) {
			interactions = Object.values( parsedData.items );
		} else {
			return;
		}

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

			const hasChanged = ! previousItem || previousItem.interactions !== currentItem.interactions;
			return hasChanged;
		} );

		changedItems.forEach( ( item ) => {
			const element = findElementByDataId( item.dataId );
			if ( element ) {
				const targetElement = getAnimationTarget( element );
				if ( targetElement ) {
					applyInteractionsToElement( targetElement, item.interactions );
				}
			}
		} );

		previousInteractionsData = currentInteractionsData;
	}

	function initEditorInteractionsHandler() {
		if ( 'undefined' === typeof animate && ! window.Motion?.animate ) {
			setTimeout( initEditorInteractionsHandler, 100 );
			return;
		}

		// Watch the head for when the script tag appears (Portal injects it later)
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

			// Initial load
			handleInteractionsUpdate();
		}

		// Watch head for script tag to appear
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

	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
	} else {
		initEditorInteractionsHandler();
	}
} )();


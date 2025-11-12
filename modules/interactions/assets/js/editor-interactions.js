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

		try {
			animateFunc( element, keyframes, options );
		} catch {}
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
			element.style.animation = 'none';
			setTimeout( () => {
				element.style.animation = 'fadeInScale 0.5s ease-out';
			}, 10 );
			return;
		}

		try {
			element.style.opacity = '0';
			element.style.transform = 'scale(0.2)';

			const animation = animateFunc(
				element,
				{
					opacity: [ 0, 1 ],
					scale: [ 0.2, 1 ],
				},
				{
					duration: 0.5,
					easing: 'ease-out',
				},
			);

			if ( animation && 'function' === typeof animation.then ) {
				animation.then( () => {
					element.style.opacity = '';
					element.style.transform = '';
				} );
			} else {
				setTimeout( () => {
					element.style.opacity = '';
					element.style.transform = '';
				}, 500 );
			}
		} catch {
			element.style.opacity = '';
			element.style.transform = '';
		}

		// TODO: Parse and apply actual interactions once we verify the system works
		// let interactions = [];
		// try {
		// 	interactions = JSON.parse( interactionsData );
		// } catch ( error ) {
		// 	console.error( '[Editor Interactions Handler] Error parsing interactions:', error );
		// 	return;
		// }
		// interactions.forEach( ( interaction ) => {
		// 	const animationName =
		// 		'string' === typeof interaction
		// 			? interaction
		// 			: interaction?.animation?.animation_id;
		// 	const animConfig = animationName && parseAnimationName( animationName );
		// 	if ( animConfig ) {
		// 		applyAnimation( element, animConfig, animateFunc );
		// 	}
		// } );
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
			childList: true, // Watch for new script tags being added
			subtree: true,
		} );

		scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
		if ( scriptTag ) {
			setupObserver( scriptTag );
			headObserver.disconnect();
		}
	}

	// Initialize when DOM is ready
	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
	} else {
		initEditorInteractionsHandler();
	}
} )();


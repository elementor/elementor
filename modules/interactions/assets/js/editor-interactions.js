
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

		console.log( '[Editor Interactions Handler] Calling animateFunc with:', {
			element,
			keyframes,
			options,
		} );

		try {
			animateFunc( element, keyframes, options );
			console.log( '[Editor Interactions Handler] Animation applied successfully' );
		} catch ( error ) {
			console.error( '[Editor Interactions Handler] Error applying animation:', error );
		}
	}

	function getInteractionsData() {
		console.log( '[Editor Interactions Handler] Getting interactions data...' );
		const scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
		console.log( '[Editor Interactions Handler] Script tag found:', scriptTag );
		if ( ! scriptTag ) {
			return [];
		}

		try {
			return JSON.parse( scriptTag.textContent || '[]' );
		} catch ( error ) {
			console.error( '[Editor Interactions Handler] Error parsing interactions data:', error );
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
		const hasBlockChildren = Array.from( element.children ).some( child => {
			const style = window.getComputedStyle( child );
			return style.display === 'block' || style.display === 'flex' || style.display === 'grid';
		} );

		// If it's a heading, button, or paragraph tag, animate it directly
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
		console.log( '[Editor Interactions Handler] applyInteractionsToElement called', {
			element,
			elementTagName: element?.tagName,
			elementId: element?.id,
			elementDataId: element?.getAttribute( 'data-id' ),
			interactionsData,
		} );

		// Check for animate function
		const animateFunc = 'undefined' !== typeof animate ? animate : window.Motion?.animate;
		
		console.log( '[Editor Interactions Handler] animateFunc check:', {
			hasAnimate: 'undefined' !== typeof animate,
			hasMotionAnimate: !!window.Motion?.animate,
			animateFunc: !!animateFunc,
		} );

		if ( ! animateFunc ) {
			console.error( '[Editor Interactions Handler] animateFunc not available! animate:', typeof animate, 'Motion:', window.Motion );
			// Still try to play a simple CSS animation as fallback
			console.log( '[Editor Interactions Handler] Trying CSS animation fallback' );
			element.style.animation = 'none';
			setTimeout( () => {
				element.style.animation = 'fadeInScale 0.5s ease-out';
			}, 10 );
			return;
		}

		// TEST: Play a hardcoded animation every time to verify the system works
		console.log( '[Editor Interactions Handler] TEST: Playing hardcoded animation on element:', element );
		
		try {
			// Store original styles to restore later
			const originalOpacity = window.getComputedStyle( element ).opacity;
			const originalTransform = window.getComputedStyle( element ).transform;
			
			// Reset element to starting state
			element.style.opacity = '0';
			element.style.transform = 'scale(0.2)';
			
			// Force a reflow to ensure styles are applied
			element.offsetHeight;
			
			// Simple fade + scale animation
			const animation = animateFunc(
				element,
				{
					opacity: [ 0, 1 ],
					scale: [ 0.2, 1 ],
				},
				{
					duration: 0.5,
					easing: 'ease-out',
				}
			);
			
			console.log( '[Editor Interactions Handler] TEST: Hardcoded animation created:', animation );
			
			// Clean up styles after animation completes
			if ( animation && typeof animation.then === 'function' ) {
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
			
		} catch ( error ) {
			console.error( '[Editor Interactions Handler] TEST: Error applying hardcoded animation:', error );
			console.error( '[Editor Interactions Handler] Error stack:', error.stack );
			// Restore styles on error
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
		console.log( '[Editor Interactions Handler] Current interactions data:', currentInteractionsData );

		// Find elements that changed (added or modified)
		const changedItems = currentInteractionsData.filter( ( currentItem ) => {
			const previousItem = previousInteractionsData.find(
				( prev ) => prev.dataId === currentItem.dataId
			);

			// New item or interactions changed
			const hasChanged = ! previousItem || previousItem.interactions !== currentItem.interactions;
			if ( hasChanged ) {
				console.log( '[Editor Interactions Handler] Item changed:', {
					dataId: currentItem.dataId,
					interactions: currentItem.interactions,
					isNew: ! previousItem,
				} );
			}
			return hasChanged;
		} );

		console.log( '[Editor Interactions Handler] Changed items:', changedItems.length );
		console.log( '[Editor Interactions Handler] Total items:', currentInteractionsData.length );

		// Apply animations to changed elements only
		changedItems.forEach( ( item ) => {
			console.log( '[Editor Interactions Handler] Looking for element with data-id:', item.dataId );
			const element = findElementByDataId( item.dataId );
			if ( element ) {
				console.log( '[Editor Interactions Handler] Found element:', element );
				// Get the actual target element to animate (might be a child)
				const targetElement = getAnimationTarget( element );
				console.log( '[Editor Interactions Handler] Animation target element:', targetElement );
				if ( targetElement ) {
					applyInteractionsToElement( targetElement, item.interactions );
				} else {
					console.warn( '[Editor Interactions Handler] No animation target found for element' );
				}
			} else {
				console.warn( '[Editor Interactions Handler] Element not found for data-id:', item.dataId );
			}
		} );

		previousInteractionsData = currentInteractionsData;
	}

	function initEditorInteractionsHandler() {
		console.log( '[Editor Interactions Handler] Initializing...' );

		// Wait for motion.dev to be available
		if ( 'undefined' === typeof animate && ! window.Motion?.animate ) {
			console.log( '[Editor Interactions Handler] Waiting for motion.dev...' );
			setTimeout( initEditorInteractionsHandler, 100 );
			return;
		}

		console.log( '[Editor Interactions Handler] motion.dev is available' );

		// Watch the head for when the script tag appears (Portal injects it later)
		const head = document.head;
		let scriptTag = null;
		let observer = null;

		function setupObserver( tag ) {
			if ( observer ) {
				observer.disconnect();
			}

			console.log( '[Editor Interactions Handler] Setting up MutationObserver for script tag' );
			observer = new MutationObserver( ( mutations ) => {
				console.log( '[Editor Interactions Handler] Mutation detected:', mutations );
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
				console.log( '[Editor Interactions Handler] Script tag appeared in head!' );
				scriptTag = foundScriptTag;
				setupObserver( scriptTag );
				headObserver.disconnect(); // Stop watching head once we found it
			}
		} );

		headObserver.observe( head, {
			childList: true,  // Watch for new script tags being added
			subtree: true,
		} );

		// Also check immediately in case it's already there
		scriptTag = document.querySelector( 'script[data-e-interactions="true"]' );
		if ( scriptTag ) {
			console.log( '[Editor Interactions Handler] Script tag already exists' );
			setupObserver( scriptTag );
			headObserver.disconnect();
		} else {
			console.log( '[Editor Interactions Handler] Script tag not found yet, watching head for it...' );
		}
	}

	// Initialize when DOM is ready
	if ( 'loading' === document.readyState ) {
		document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
	} else {
		initEditorInteractionsHandler();
	}
} )();


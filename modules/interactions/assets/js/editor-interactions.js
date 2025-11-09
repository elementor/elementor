
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

	function applyInteractionsToElement( element, interactionsData ) {
		const animateFunc = 'undefined' !== typeof animate ? animate : window.Motion?.animate;

		if ( ! animateFunc ) {
			console.warn( '[Editor Interactions Handler] animateFunc not available' );
			return;
		}

		let interactions = [];

		try {
			interactions = JSON.parse( interactionsData );
		} catch ( error ) {
			console.error( '[Editor Interactions Handler] Error parsing interactions:', error );
			return;
		}

		console.log( '[Editor Interactions Handler] Applying interactions to element:', {
			element,
			interactions,
			interactionsData,
		} );

		interactions.forEach( ( interaction ) => {
			const animationName =
				'string' === typeof interaction
					? interaction
					: interaction?.animation?.animation_id;

			console.log( '[Editor Interactions Handler] Processing interaction:', {
				interaction,
				animationName,
			} );

			const animConfig = animationName && parseAnimationName( animationName );

			if ( animConfig ) {
				console.log( '[Editor Interactions Handler] Applying animation:', animConfig );
				applyAnimation( element, animConfig, animateFunc );
			} else {
				console.warn( '[Editor Interactions Handler] No animConfig for:', animationName );
			}
		} );
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

		// Apply animations to changed elements
		changedItems.forEach( ( item ) => {
			console.log( '[Editor Interactions Handler] Looking for element with data-id:', item.dataId );
			const element = findElementByDataId( item.dataId );
			if ( element ) {
				console.log( '[Editor Interactions Handler] Found element, applying interactions:', element );
				applyInteractionsToElement( element, item.interactions );
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


'use strict';

import { config, getKeyframes, parseAnimationName } from './interactions-utils.js';

function applyAnimation( element, animConfig, animateFunc ) {
	const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction, element );
	const hasDirection = !! animConfig.direction;
	const hasFade = 'fade' === animConfig.effect;

	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		easing: config.easing,
	};

	if ( hasDirection && hasFade ) {
		const isIn = 'in' === animConfig.type;
		if ( isIn ) {
			options.opacity = {
				easing: 'easeOut',
			};
		} else {
			options.opacity = {
				easing: 'easeIn',
			};
		}
	}

	const initialKeyframes = {};
	Object.keys( keyframes ).forEach( ( key ) => {
		initialKeyframes[ key ] = keyframes[ key ][ 0 ];
	} );
	// WHY - Transition can be set on elements but once it sets it destroys all animations, so we basically put it aside.
	const transition = element.style.transition;
	element.style.transition = 'none';
	animateFunc( element, initialKeyframes, { duration: 0 } ).then( () => {
		animateFunc( element, keyframes, options ).then( () => {
			if ( 'out' === animConfig.type ) {
				const resetValues = { opacity: 1, scale: 1, x: 0, y: 0 };
				const resetKeyframes = {};
				Object.keys( keyframes ).forEach( ( key ) => {
					resetKeyframes[ key ] = resetValues[ key ];
				} );
				element.style.transition = transition;
				animateFunc( element, resetKeyframes, { duration: 0 } );
			}
		} );
	} );
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
	if ( 'string' === typeof interactionsData ) {
		try {
			parsedData = JSON.parse( interactionsData );
		} catch ( error ) {
			return;
		}
	} else {
		parsedData = interactionsData;
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
		const prevInteractions = previousInteractionsData.find( ( prev ) => prev.dataId === item.dataId )?.interactions;
		if ( element && item.interactions?.items?.length > 0 && item.interactions?.items?.length === prevInteractions?.items?.length ) {
			const interactionsToApply = {
				...item.interactions,
				items: [ ...item.interactions.items ].filter( ( interaction, index ) => prevInteractions?.items[ index ]?.animation?.animation_id !== interaction.animation.animation_id ),
			};
			applyInteractionsToElement( element, interactionsToApply );
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
	const { elementId, animationId } = event.detail;
	const interactionsData = getInteractionsData();
	const item = interactionsData.find( ( elementItemData ) => elementItemData.dataId === elementId );
	if ( ! item ) {
		return;
	}
	const element = findElementByInteractionId( elementId );
	if ( element ) {
		const interactionsCopy = {
			...item.interactions,
			items: [ ...item.interactions.items ],
		};
		interactionsCopy.items = interactionsCopy.items.filter( ( interactionItem ) => interactionItem.animation.animation_id === animationId );
		applyInteractionsToElement( element, JSON.stringify( interactionsCopy ) );
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
} else {
	initEditorInteractionsHandler();
}


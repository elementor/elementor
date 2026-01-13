'use strict';

import { config, getKeyframes, parseAnimationName } from './interactions-utils.js';

function extractAnimationId( interaction ) {
	if ( 'string' === typeof interaction ) {
		return interaction;
	}

	if ( 'interaction-item' === interaction?.$$type && interaction?.value ) {
		const { trigger, animation } = interaction.value;
		if ( 'animation-preset-props' === animation?.$$type && animation?.value ) {
			const { effect, type, direction, timing_config: timingConfig } = animation.value;
			const triggerVal = trigger?.value || 'load';
			const effectVal = effect?.value || 'fade';
			const typeVal = type?.value || 'in';
			const directionVal = direction?.value || '';
			const duration = timingConfig?.value?.duration?.value ?? 300;
			const delay = timingConfig?.value?.delay?.value ?? 0;
			return `${ triggerVal }-${ effectVal }-${ typeVal }-${ directionVal }-${ duration }-${ delay }`;
		}
	}

	if ( interaction?.animation?.animation_id ) {
		return interaction.animation.animation_id;
	}

	return null;
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
		const animationName = extractAnimationId( interaction );

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
				items: [ ...item.interactions.items ].filter( ( interaction, index ) => {
					const currentAnimId = extractAnimationId( interaction );
					const prevAnimId = extractAnimationId( prevInteractions?.items[ index ] );
					return currentAnimId !== prevAnimId;
				} ),
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
		interactionsCopy.items = interactionsCopy.items.filter( ( interactionItem ) => extractAnimationId( interactionItem ) === animationId );
		applyInteractionsToElement( element, JSON.stringify( interactionsCopy ) );
	}
}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
} else {
	initEditorInteractionsHandler();
}


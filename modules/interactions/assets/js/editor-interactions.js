'use strict';

import { config, getKeyframes, parseAnimationName } from './interactions-utils.js';

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

	if ( 'out' === animConfig.type ) {
		const totalAnimationTime = animConfig.duration + animConfig.delay;
		const resetValues = { opacity: 1, scale: 1, x: 0, y: 0 };

		setTimeout( () => {
			const resetKeyframes = {};
			Object.keys( keyframes ).forEach( ( key ) => {
				resetKeyframes[ key ] = resetValues[ key ];
			} );

			animateFunc( element, resetKeyframes, { duration: 0 } );
		}, totalAnimationTime );
	}
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


'use strict';

import {
	config,
	getKeyframes,
	parseAnimationName,
	extractAnimationId,
	extractInteractionId,
	getAnimateFunction,
	waitForAnimateFunction,
	parseInteractionsData,
} from './interactions-utils.js';

function applyAnimation( element, animConfig, animateFunc ) {
	const keyframes = getKeyframes( animConfig.effect, animConfig.type, animConfig.direction, element );
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
	const animateFunc = getAnimateFunction();

	if ( ! animateFunc ) {
		return;
	}

	const parsedData = parseInteractionsData( interactionsData );
	if ( ! parsedData ) {
		return;
	}

	const interactions = Object.values( parsedData?.items || [] );

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

		if ( ! previousItem ) {
			return true;
		}

		const currentIds = ( currentItem.interactions?.items || [] )
			.map( extractInteractionId )
			.filter( Boolean )
			.sort()
			.join( ',' );
		const prevIds = ( previousItem.interactions?.items || [] )
			.map( extractInteractionId )
			.filter( Boolean )
			.sort()
			.join( ',' );

		return currentIds !== prevIds;
	} );

	changedItems.forEach( ( item ) => {
		const element = findElementByInteractionId( item.dataId );
		const prevInteractions = previousInteractionsData.find( ( prev ) => prev.dataId === item.dataId )?.interactions;

		if ( ! element || ! item.interactions?.items?.length ) {
			return;
		}

		const prevIds = new Set( ( prevInteractions?.items || [] ).map( extractInteractionId ).filter( Boolean ) );
		const changedInteractions = item.interactions.items.filter( ( interaction ) => {
			const id = extractInteractionId( interaction );
			return ! id || ! prevIds.has( id );
		} );

		if ( changedInteractions.length > 0 ) {
			applyInteractionsToElement( element, {
				...item.interactions,
				items: changedInteractions,
			} );
		}
	} );

	previousInteractionsData = currentInteractionsData;
}

function initEditorInteractionsHandler() {
	waitForAnimateFunction( () => {
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
	} );
}

function registerWindowEvents() {
	window.top.addEventListener( 'atomic/play_interactions', handlePlayInteractions );
}

function handlePlayInteractions( event ) {
	const { elementId, interactionId } = event.detail;
	const interactionsData = getInteractionsData();
	const item = interactionsData.find( ( elementItemData ) => elementItemData.dataId === elementId );
	if ( ! item ) {
		return;
	}

	const element = findElementByInteractionId( elementId );
	if ( ! element ) {
		return;
	}
	const interactionsCopy = {
		...item.interactions,
		items: item.interactions.items.filter( ( interactionItem ) => {
			const itemId = extractInteractionId( interactionItem );
			return itemId === interactionId;
		} ),
	};
	applyInteractionsToElement( element, interactionsCopy );

}

if ( 'loading' === document.readyState ) {
	document.addEventListener( 'DOMContentLoaded', initEditorInteractionsHandler );
} else {
	initEditorInteractionsHandler();
}


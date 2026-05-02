'use strict';

import {
	config,
	getKeyframes,
	getTransformBaselineFromComputedStyle,
	preserveTransformKeyframes,
	extractAnimationConfig,
	extractInteractionId,
	getAnimateFunction,
	waitForAnimateFunction,
	parseInteractionsData,
	resetElementStyles,
} from './interactions-utils.js';

/**
 * @type {Record<string, Promise<void> & { cancel: () => void }>}
 */
const playingInteractionsToStop = {};

function applyAnimation( element, animConfig, animateFunc ) {
	const { id } = element;
	if ( playingInteractionsToStop[ id ] ) {
		playingInteractionsToStop[ id ].cancel();
		delete playingInteractionsToStop[ id ];
	}
	const baseline = getTransformBaselineFromComputedStyle( element );
	const keyframes = preserveTransformKeyframes(
		getKeyframes( animConfig.effect, animConfig.type, animConfig.direction ),
		baseline,
	);

	const options = {
		duration: animConfig.duration / 1000,
		delay: animConfig.delay / 1000,
		ease: config().defaultEasing,
	};

	const initialKeyframes = {};
	Object.keys( keyframes ).forEach( ( key ) => {
		initialKeyframes[ key ] = keyframes[ key ][ 0 ];
	} );

	animateFunc( element, initialKeyframes, { duration: 0 } ).then( () => {
		const animation = animateFunc( element, keyframes, options );

		playingInteractionsToStop[ id ] = animation;

		animation.then( () => {
			requestAnimationFrame( () => {
				resetElementStyles( element );
			} );

			delete playingInteractionsToStop[ id ];
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
		const animConfig = extractAnimationConfig( interaction );

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


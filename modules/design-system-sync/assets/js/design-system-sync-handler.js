( function() {
	'use strict';

	const SYNC_ENDPOINT = wpApiSettings.root + 'elementor/v1/design-system-sync/stylesheet';
	const SYNC_STYLESHEET_ID = 'elementor-design-system-sync-css';
	const DEBOUNCE_MS = 500;

	let syncTimeout;

	function syncDesignSystem() {
		fetch( SYNC_ENDPOINT, {
			method: 'POST',
			headers: {
				'X-WP-Nonce': wpApiSettings.nonce,
			},
		} )
			.then( ( response ) => {
				if ( ! response.ok ) {
					return;
				}

				return response.json();
			} )
			.then( ( data ) => {
				if ( ! data ) {
					return;
				}

				refreshGlobals();
				reloadCanvasDesignSyncStyles( data );
			} );
	}

	function refreshGlobals() {
		const globals = $e.components.get( 'globals' );
		globals?.refreshGlobalData();
		globals?.populateGlobalData();
	}

	function reloadCanvasDesignSyncStyles( { url } ) {
		const previewFrame = document.getElementById( 'elementor-preview-iframe' );

		if ( ! previewFrame?.contentDocument ) {
			return;
		}

		let link = previewFrame.contentDocument.getElementById( SYNC_STYLESHEET_ID );

		if ( ! link ) {
			link = previewFrame.contentDocument.createElement( 'link' );
			link.id = SYNC_STYLESHEET_ID;
			link.rel = 'stylesheet';
			previewFrame.contentDocument.head.appendChild( link );
		}

		link.href = url;
	}

	function onClassesUpdated( event ) {
		const { context } = event.detail;

		if ( context !== 'frontend' ) {
			return;
		}

		clearTimeout( syncTimeout );
		syncTimeout = setTimeout( syncDesignSystem, DEBOUNCE_MS );
	}

	window.addEventListener( 'classes:updated', onClassesUpdated );
	window.addEventListener( 'variables:updated', () => {
		clearTimeout( syncTimeout );
		syncTimeout = setTimeout( syncDesignSystem, DEBOUNCE_MS );
	} );
}() );

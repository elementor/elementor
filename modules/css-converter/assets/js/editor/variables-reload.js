/**
 * CSS Converter Variables Reload
 *
 * Ensures CSS Converter variables are loaded into the editor preview by:
 * 1. Reloading variables from the server when document loads
 * 2. Reloading variables after widget conversion completes
 * 3. Using Elementor's native variables system to inject variables into preview
 */

( function() {
	'use strict';

	// Wait for Elementor to be ready
	jQuery( window ).on( 'elementor:init', function() {
		reloadVariablesAfterDocumentLoad();
		listenForVariableChanges();
	} );

	function reloadVariablesAfterDocumentLoad() {
		elementor.on( 'document:loaded', function() {
			setTimeout( function() {
				reloadVariables();
			}, 500 );
		} );
	}

	function listenForVariableChanges() {
		jQuery( window ).on( 'elementor/css-converter/variables-created', function( event, data ) {
			if ( data && ( data.variables_created > 0 || data.variables_reused > 0 ) ) {
				setTimeout( function() {
					reloadVariables();
				}, 300 );
			}
		} );
	}

	function reloadVariables() {
		if ( ! window.elementor || ! window.elementorCommon ) {
			return;
		}

		if ( window.$e && window.$e.run && window.$e.components && window.$e.components.get ) {
			try {
				const variablesComponent = window.$e.components.get( 'variables' );
				if ( variablesComponent && variablesComponent.service && typeof variablesComponent.service.load === 'function' ) {
					variablesComponent.service.load().then( function( variables ) {
						const variablesCount = Object.keys( variables || {} ).length;
						console.log( 'CSS Converter: Variables reloaded via service', variablesCount, 'variables' );
					} ).catch( function( error ) {
						console.warn( 'CSS Converter: Service reload failed, using API fallback', error );
						reloadVariablesViaApi();
					} );
					return;
				}
			} catch ( error ) {
				console.warn( 'CSS Converter: Error accessing variables service, using API fallback', error );
			}
		}

		reloadVariablesViaApi();
	}

	function reloadVariablesViaApi() {
		const apiUrl = elementorCommon.config.urls.rest + 'elementor/v1/variables/list';
		const nonce = elementorCommon.config.nonce || '';

		fetch( apiUrl, {
			method: 'GET',
			headers: {
				'X-WP-Nonce': nonce,
			},
			credentials: 'include',
		} )
		.then( function( response ) {
			return response.json();
		} )
		.then( function( data ) {
			if ( data.success && data.data && data.data.variables ) {
				const variablesCount = Object.keys( data.data.variables ).length;
				console.log( 'CSS Converter: Variables loaded via API', variablesCount, 'variables' );

				if ( elementor.reloadPreview ) {
					setTimeout( function() {
						elementor.reloadPreview();
					}, 200 );
				}
			} else {
				console.warn( 'CSS Converter: Variables API returned unexpected format', data );
			}
		} )
		.catch( function( error ) {
			console.error( 'CSS Converter: Error reloading variables via API:', error );
		} );
	}
}() );


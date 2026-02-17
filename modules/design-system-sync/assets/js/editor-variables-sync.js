( function() {
	'use strict';

	function hasSyncRelatedChanges( previousVariables, currentVariables ) {
		for ( const id in currentVariables ) {
			if ( ! currentVariables.hasOwnProperty( id ) ) {
				continue;
			}

			const variable = currentVariables[ id ];
			const previous = previousVariables[ id ];

			if ( ! previous && variable.sync_to_v3 ) {
				return true;
			}

			if ( ! previous ) {
				continue;
			}

			const isSyncEnabledOrDisabled = previous.sync_to_v3 !== variable.sync_to_v3;
			const isLabelOrValueChanged = previous.label !== variable.label || previous.value !== variable.value;

			if ( isSyncEnabledOrDisabled || isLabelOrValueChanged ) {
				return true;
			}
		}

		for ( const id in previousVariables ) {
			if ( ! previousVariables.hasOwnProperty( id ) ) {
				continue;
			}

			if ( previousVariables[ id ].sync_to_v3 && ! currentVariables[ id ] ) {
				return true;
			}
		}

		return false;
	}

	window.addEventListener( 'variables:updated', function( event ) {
		if ( ! event?.detail ) {
			return;
		}

		try {
			const { variables = {}, previousVariables = {} } = event.detail;

			if ( hasSyncRelatedChanges( previousVariables, variables ) ) {
				const globals = $e.components.get( 'globals' );

				globals?.refreshGlobalData();
				globals?.populateGlobalData();
			}
		} catch ( error ) {}
	} );
}() );

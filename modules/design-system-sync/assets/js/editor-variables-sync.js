( function() {
	'use strict';

	function hasSyncRelatedChanges( originalVariables, currentVariables, deleted ) {
		var id, variable, original, changedLabelOrValue;

		for ( id in currentVariables ) {
			if ( ! currentVariables.hasOwnProperty( id ) ) {
				continue;
			}
			variable = currentVariables[ id ];
			original = originalVariables[ id ];

			if ( ! original && variable.sync_to_v3 ) {
				return true;
			}
			if ( ! original ) {
				continue;
			}
			if ( original.sync_to_v3 !== variable.sync_to_v3 ) {
				return true;
			}
			changedLabelOrValue = original.label !== variable.label || original.value !== variable.value;
			if ( variable.sync_to_v3 && changedLabelOrValue ) {
				return true;
			}
		}

		for ( var i = 0; i < deleted.length; i++ ) {
			if ( originalVariables[ deleted[ i ] ]?.sync_to_v3 ) {
				return true;
			}
		}

		return false;
	}

	window.addEventListener( 'elementor/editor-variables/saved-with-sync', function( event ) {
		try {
			const { originalVariables = {}, variables = {}, deletedVariables = [] } = event.detail;
			const globals = $e.components.get( 'globals' );

			if ( hasSyncRelatedChanges( originalVariables, variables, deletedVariables ) ) {
				globals?.refreshGlobalData();
				$e.data.deleteCache( $e.components.get( 'globals' ), 'globals/colors' );
			}
		} catch ( error ) {}
	} );
}() );

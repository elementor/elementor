( function( $ ) {
	'use strict';

	elementor.hooks.addAction( 'panel/open_editor/kit', function() {
		// Wait for controls to be rendered
		setTimeout( function() {
			const $v4Controls = $( '.elementor-control-v4-variables-readonly' );

			if ( ! $v4Controls.length ) {
				return;
			}

			// Disable all inputs
			$v4Controls.find( 'input' ).prop( 'disabled', true ).prop( 'readonly', true );
			
			// Disable color picker
			$v4Controls.find( '.pcr-button' ).on( 'click', function( e ) {
				e.preventDefault();
				e.stopPropagation();
				return false;
			} );

			// Hide all tool buttons
			$v4Controls.find( '.elementor-repeater-row-tool, .elementor-repeater-tool' ).remove();

			// Disable sorting
			$v4Controls.find( '.elementor-repeater-fields-wrapper' ).sortable( 'disable' );
		}, 100 );
	} );
} )( jQuery );


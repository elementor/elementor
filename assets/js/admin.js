( function( $, window, document ) {
	'use strict';

	var ElementorAdminApp = {
		cache: {},

		cacheElements: function() {
			this.cache.$body = $( 'body' );
			this.cache.$switchMode = $( '#elementor-switch-mode' );
			this.cache.$switchModeInput = this.cache.$switchMode.find( '.elementor-switch-mode-input' );
			this.cache.$switchModeButton = this.cache.$switchMode.find( '.elementor-switch-mode-button' );


			this.cache.$builderEditor = $( '#elementor-editor' );
		},

		toggleStatus: function() {
			var isBuilderMode = 'builder' === this.getEditMode();

			this.cache.$body
			    .toggleClass( 'elementor-editor-active', isBuilderMode )
			    .toggleClass( 'elementor-editor-inactive', ! isBuilderMode );
		},

		bindEvents: function() {
			var self = this;

			self.cache.$switchModeButton.on( 'click', function( event ) {
				event.preventDefault();

				if ( 'builder' === self.cache.$switchModeInput.val() ) {
					self.cache.$switchModeInput.val( 'editor' );
				} else {
					self.cache.$switchModeInput.val( 'builder' );

					var $wpTitle = $( '#title' );

					if ( ! $wpTitle.val() ) {
						$wpTitle.val( 'Elementor #' + $( '#post_ID' ).val() );
					}
					wp.autosave.server.triggerSave();

					$( document ).on( 'heartbeat-tick.autosave', function() {
						$( window ).off( 'beforeunload.edit-post' );
						window.location = $self.cache.$builderEditor.find( 'a' ).attr( 'href' );
					} );
				}

				self.toggleStatus();
			} );

			} );
		},

		init: function() {
			this.cacheElements();
			this.bindEvents();
		},

		getEditMode: function() {
			return this.cache.$switchModeInput.val();
		},
		}
	};

	$( function() {
		ElementorAdminApp.init();
	} );

}( jQuery, window, document ) );

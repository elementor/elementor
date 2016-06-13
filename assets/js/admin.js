( function( $, window, document ) {
	'use strict';

	var ElementorAdminApp = {
		cache: {},

		cacheElements: function() {
			this.cache.$body = $( 'body' );
			this.cache.$switchMode = $( '#elementor-switch-mode' );
			this.cache.$goToEditLink = $( '#elementor-go-to-edit-page-link' );
			this.cache.$switchModeInput = this.cache.$switchMode.find( '.elementor-switch-mode-input' );
			this.cache.$switchModeButton = this.cache.$switchMode.find( '.elementor-switch-mode-button' );

			this.cache.$elementorLoader = $( '#elementor-loader' );

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

					self.animateLoader();

					$( document ).on( 'heartbeat-tick.autosave', function() {
						$( window ).off( 'beforeunload.edit-post' );
						window.location = self.cache.$goToEditLink.attr( 'href' );
					} );
				}

				self.toggleStatus();
			} );

			self.cache.$goToEditLink.on( 'click', function() {
				self.animateLoader();
			} );
		},

		init: function() {
			this.cacheElements();
			this.bindEvents();
		},

		getEditMode: function() {
			return this.cache.$switchModeInput.val();
		},

		animateLoader: function() {
			this.cache.$elementorLoader.addClass( 'elementor-animate' );
		}
	};

	$( function() {
		ElementorAdminApp.init();
	} );

}( jQuery, window, document ) );

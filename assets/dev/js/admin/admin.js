( function( $, window, document ) {
	'use strict';

	var ElementorAdminApp = {

		cacheElements: function() {
			this.cache = {
				$body: $( 'body' ),
				$switchMode: $( '#elementor-switch-mode' ),
				$goToEditLink: $( '#elementor-go-to-edit-page-link' ),
				$switchModeInput: $( '#elementor-switch-mode-input' ),
				$switchModeButton: $( '#elementor-switch-mode-button' ),
				$elementorLoader: $( '.elementor-loader' ),
				$builderEditor: $( '#elementor-editor' )
			};
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

				if ( 'builder' === self.getEditMode() ) {
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

			$( 'div.notice.elementor-message-dismissed' ).on( 'click', 'button.notice-dismiss', function( event ) {
				event.preventDefault();

				$.post( ajaxurl, {
					action: 'elementor_set_admin_notice_viewed',
					notice_id: $( this ).closest( '.elementor-message-dismissed' ).data( 'notice_id' )
				} );
			} );

			$( '#elementor-library-sync-button' ).on( 'click', function( event ) {
				event.preventDefault();
				var $thisButton = $( this );

				$thisButton.removeClass( 'success' ).addClass( 'loading' );

				$.post( ajaxurl, {
					action: 'elementor_reset_library',
					_nonce: $thisButton.data( 'nonce' )
				} )
					.done( function() {
						$thisButton.removeClass( 'loading' ).addClass( 'success' );
					} );
			} );
		},

		init: function() {
			this.cacheElements();
			this.bindEvents();

			this.initTemplatesImport();
		},

		initTemplatesImport: function() {
			if ( ! this.cache.$body.hasClass( 'post-type-elementor_library' ) ) {
				return;
			}

			var self = this,
				$importButton = self.cache.$importButton = $( '#elementor-import-template-trigger' ),
				$importArea = self.cache.$importArea = $( '#elementor-import-template-area' );

			self.cache.$formAnchor = $( 'h1' );

			$( '#wpbody-content' ).find( '.page-title-action' ).after( $importButton );

			self.cache.$formAnchor.after( self.cache.$importArea );

			$importButton.on( 'click', function() {
				$importArea.toggle();
			} );
		},

		getEditMode: function() {
			return this.cache.$switchModeInput.val();
		},

		animateLoader: function() {
			this.cache.$goToEditLink.addClass( 'elementor-animate' );
		}
	};

	$( function() {
		ElementorAdminApp.init();
	} );

}( jQuery, window, document ) );

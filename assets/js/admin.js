( function( $, window, document, undefined ) {
	'use strict';

	var ElementorAdminApp = {
		cache: {},

		cacheElements: function() {
			this.cache.$switchMode = $( '#elementor-switch-mode' );
			this.cache.$switchModeInput = this.cache.$switchMode.find( '.elementor-switch-mode-input' );
			this.cache.$switchModeButton = this.cache.$switchMode.find( '.elementor-switch-mode-button' );

			this.cache.$switchModeButtonEditorStatus = this.cache.$switchModeButton.find( '.elementor-switch-mode-off' );
			this.cache.$switchModeButtonBuilderStatus = this.cache.$switchModeButton.find( '.elementor-switch-mode-on' );

			this.cache.$builderEditor = $( '#elementor-editor' );
			this.cache.$wpEditor = $( '#postdivrich' );
		},

		buildElements: function() {
			var $self = this;
			setTimeout( function() {
				$self.toggleStatus( $self );
			}, 300 );

			$self.cache.$switchModeButton.show();
		},

		toggleStatus: function( $self ) {
			if ( 'builder' === $self.cache.$switchModeInput.val() ) {
				$self.cache.$switchModeButtonBuilderStatus.show();
				$self.cache.$switchModeButtonEditorStatus.hide();

				$self.cache.$builderEditor
					.removeClass( 'elementor-editor-inactive' )
					.addClass( 'elementor-editor-active' );

				$self.cache.$wpEditor.hide();

				$self.cache.$switchMode
					.removeClass( 'elementor-editor-inactive' )
					.addClass( 'elementor-editor-active' );
			} else {
				$self.cache.$switchModeButtonEditorStatus.show();
				$self.cache.$switchModeButtonBuilderStatus.hide();

				$self.cache.$wpEditor.show();
				$self.cache.$builderEditor
					.addClass( 'elementor-editor-inactive' )
					.removeClass( 'elementor-editor-active' );

				$self.cache.$switchMode
					.addClass( 'elementor-editor-inactive' )
					.removeClass( 'elementor-editor-active' );
			}
		},

		bindEvents: function() {
			var $self = this;

			$self.cache.$switchModeButton.on( 'click', function( event ) {
				event.preventDefault();

				if ( 'builder' === $self.cache.$switchModeInput.val() ) {
					$self.cache.$switchModeInput.val( 'editor' );
				} else {
					$self.cache.$switchModeInput.val( 'builder' );

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

				$self.toggleStatus( $self );
			} );
		},

		init: function() {
			this.cacheElements();
			this.buildElements();
			this.bindEvents();
		}
	};

	$( document ).ready( function( $ ) {
		ElementorAdminApp.init();
	} );

}( jQuery, window, document ) );

/* global jQuery, ElementorGutenbergSettings */
( function( $ ) {
	'use strict';

	var ElementorGutenbergApp = {

		cacheElements: function() {
			this.isElementorMode = '1' === ElementorGutenbergSettings.isElementorMode;

			this.cache = {};

			this.cache.$gutenberg = $( '#editor' );
			this.cache.$switchMode = $( $( '#elementor-gutenberg-button-switch-mode' ).html() );

			this.cache.$gutenberg.find( '.edit-post-header-toolbar' ).append( this.cache.$switchMode );
			this.cache.$switchModeButton = this.cache.$switchMode.find( '#elementor-switch-mode-button' );

			this.cache.$editorPanel = $( $( '#elementor-gutenberg-panel' ).html() );

			this.cache.$gurenbergBlockList = this.cache.$gutenberg.find( '.editor-block-list__layout' );
			this.cache.$gurenbergBlockList.after( this.cache.$editorPanel );

			this.cache.$editorPanelButton = this.cache.$editorPanel.find( '#elementor-go-to-edit-page-link' );

			this.toggleStatus();
		},

		bindEvents: function() {
			var self = this;

			self.cache.$switchModeButton.on( 'click', function() {
				self.isElementorMode = ! self.isElementorMode;

				self.toggleStatus();

				if ( self.isElementorMode ) {
					self.cache.$editorPanelButton.trigger( 'click' );
				} else {
					var wpEditor = wp.data.dispatch( 'core/editor' );

					wpEditor.editPost( { gutenberg_elementor_mode: false } );
					wpEditor.savePost();
				}
			} );

			self.cache.$editorPanelButton.on( 'click', function( event ) {
				event.preventDefault();

				self.animateLoader();

				wp.data.dispatch( 'core/editor' ).savePost();
				self.redirectWhenSave();
			} );
		},

		redirectWhenSave: function() {
			var self = this;

			setTimeout( function() {
				if ( wp.data.select( 'core/editor' ).isSavingPost() ) {
					self.redirectWhenSave();
				} else {
					location.href = ElementorGutenbergSettings.editLink;
				}
			}, 300 );
		},

		animateLoader: function() {
			this.cache.$editorPanelButton.addClass( 'elementor-animate' );
		},

		toggleStatus: function() {
			jQuery( 'body' )
				.toggleClass( 'elementor-editor-active', this.isElementorMode )
				.toggleClass( 'elementor-editor-inactive', ! this.isElementorMode );
		},

		init: function() {
			this.cacheElements();
			this.bindEvents();
		}
	};

	$( function() {
		ElementorGutenbergApp.init();
	} );

}( jQuery ) );

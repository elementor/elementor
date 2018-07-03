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

			this.toggleStatus();
			this.buildPanel();

			var self = this;

			wp.data.subscribe( function() {
				setTimeout( function() {
					self.buildPanel();
				}, 1 );
			} );
		},

		buildPanel: function() {
			var self = this;

			if ( ! $( '#elementor-editor' ).length ) {
				self.cache.$editorPanel = $( $( '#elementor-gutenberg-panel' ).html() );
				self.cache.$gurenbergBlockList = self.cache.$gutenberg.find( '.editor-block-list__layout, .editor-post-text-editor' );
				self.cache.$gurenbergBlockList.after( self.cache.$editorPanel );

				self.cache.$editorPanelButton = self.cache.$editorPanel.find( '#elementor-go-to-edit-page-link' );

				self.cache.$editorPanelButton.on( 'click', function( event ) {
					event.preventDefault();

					self.animateLoader();

					var documentTitle = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' );
					if ( ! documentTitle ) {
						wp.data.dispatch( 'core/editor' ).editPost( { title: 'Elementor #' + $( '#post_ID' ).val() } );
					}

					wp.data.dispatch( 'core/editor' ).savePost();
					self.redirectWhenSave();
				} );
			}
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
			var self = this;
			setTimeout( function() {
				self.cacheElements();
				self.bindEvents();
			}, 1 );
		}
	};

	$( function() {
		ElementorGutenbergApp.init();
	} );

}( jQuery ) );

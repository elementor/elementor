/* global ElementorGutenbergSettings */
( function( $ ) {
	'use strict';

	var ElementorGutenbergApp = {

		cacheElements() {
			var self = this;

			self.isElementorMode = ElementorGutenbergSettings.isElementorMode;

			self.cache = {};

			self.cache.$gutenberg = $( '#editor' );
			self.cache.$switchMode = $( $( '#elementor-gutenberg-button-switch-mode' ).html() );
			self.cache.$switchModeButton = self.cache.$switchMode.find( '#elementor-switch-mode-button' );

			self.bindEvents();
			self.toggleStatus();

			wp.data.subscribe( function() {
				setTimeout( function() {
					self.buildPanel();
				}, 1 );
			} );
		},

		buildPanel() {
			var self = this;

			if ( ! self.cache.$gutenberg.find( '#elementor-switch-mode' ).length ) {
				self.cache.$gutenberg.find( '.edit-post-header-toolbar' ).append( self.cache.$switchMode );
			}

			if ( this.hasIframe() ) {
				this.hideIframeContent();
			}

			if ( ! $( '#elementor-editor' ).length ) {
				self.cache.$editorPanel = $( $( '#elementor-gutenberg-panel' ).html() );

				self.cache.$gurenbergBlockList = self.cache.$gutenberg.find( '.is-desktop-preview' );
				self.cache.$gurenbergBlockList.append( self.cache.$editorPanel );

				self.cache.$editorPanelButton = self.cache.$editorPanel.find( '#elementor-go-to-edit-page-link' );

				self.cache.$editorPanelButton.on( 'click', function( event ) {
					event.preventDefault();

					self.animateLoader();

					// A new post is initialized as an 'auto-draft'.
					// if the post is not a new post it should not save it to avoid some saving conflict between elementor and gutenberg.
					const isNewPost = 'auto-draft' === wp.data.select( 'core/editor' ).getCurrentPost().status;

					if ( isNewPost ) {
						var documentTitle = wp.data.select( 'core/editor' ).getEditedPostAttribute( 'title' );
						if ( ! documentTitle ) {
							wp.data.dispatch( 'core/editor' ).editPost( { title: 'Elementor #' + $( '#post_ID' ).val() } );
						}

						wp.data.dispatch( 'core/editor' ).savePost();
					}

					self.redirectWhenSave();
				} );
			}
		},

		// Sometimes Gutenberg uses iframe instead of div.
		hasIframe() {
			return !! this.cache.$gutenberg.find( 'iframe[name="editor-canvas"]' ).length;
		},

		hideIframeContent() {
			if ( ! this.isElementorMode ) {
				return;
			}

			const style = `<style>
				.editor-post-text-editor,
				.block-editor-block-list__layout {
					display: none;
				}

				body {
					padding: 0 !important;
				}
			</style>`;

			this.cache.$gutenberg.find( 'iframe[name="editor-canvas"]' ).contents().find( 'body' ).append( style );
		},

		bindEvents() {
			var self = this;

			self.cache.$switchModeButton.on( 'click', function() {
				if ( self.isElementorMode ) {
					elementorCommon.dialogsManager.createWidget( 'confirm', {
						message: __( 'Please note that you are switching to WordPress default editor. Your current layout, design and content might break.', 'elementor' ),
						headerMessage: __( 'Back to WordPress Editor', 'elementor' ),
						strings: {
							confirm: __( 'Continue', 'elementor' ),
							cancel: __( 'Cancel', 'elementor' ),
						},
						defaultOption: 'confirm',
						onConfirm() {
							const wpEditor = wp.data.dispatch( 'core/editor' );

							wpEditor.editPost( { gutenberg_elementor_mode: false } );
							wpEditor.savePost();
							self.isElementorMode = ! self.isElementorMode;
							self.toggleStatus();
						},
					} ).show();
				} else {
					self.isElementorMode = ! self.isElementorMode;
					self.toggleStatus();
					self.cache.$editorPanelButton.trigger( 'click' );
				}
			} );
		},

		redirectWhenSave() {
			var self = this;

			setTimeout( function() {
				if ( wp.data.select( 'core/editor' ).isSavingPost() ) {
					self.redirectWhenSave();
				} else {
					location.href = ElementorGutenbergSettings.editLink;
				}
			}, 300 );
		},

		animateLoader() {
			this.cache.$editorPanelButton.addClass( 'elementor-animate' );
		},

		toggleStatus() {
			jQuery( 'body' )
				.toggleClass( 'elementor-editor-active', this.isElementorMode )
				.toggleClass( 'elementor-editor-inactive', ! this.isElementorMode );
		},

		init() {
			this.cacheElements();
		},
	};

	$( function() {
		ElementorGutenbergApp.init();
	} );
}( jQuery ) );

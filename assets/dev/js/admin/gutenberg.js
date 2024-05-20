
/* global ElementorGutenbergSettings */
import App from '../../../../modules/ai/assets/js/editor/app';
import PromptDialog from '../../../../modules/ai/assets/js/editor/components/prompt-dialog';
import Loader from '../../../../modules/ai/assets/js/editor/components/loader';
import LoaderAI from '../../../../modules/ai/assets/js/editor/loader';
import { ThemeProvider } from '@elementor/ui';
import GenerateExcerptWithAI from './excerpt-ai';

( function( $ ) {
	'use strict';
	//
	// 	const { registerPlugin } = wp.plugins;
	// 	const { PluginDocumentSettingPanel } = wp.editPost;
	// 	const { PanelBody, Button } = wp.components;
	// 	const { Fragment } = wp.element;
	// 	const { useSelect } = wp.data;
	// 	const { __ } = wp.i18n;
	// 	const { addFilter } = wp.hooks;
	//
	// // Custom button component to be added to the Excerpt panel
	// 	const CustomButton = () => {
	// 		const handleClick = () => {
	// 			alert('Custom Excerpt Button clicked!');
	// 		};
	//
	// 		return (
	// 			<Button isPrimary onClick={handleClick}>
	// 				{__('Custom Button', 'custom-excerpt-button')}
	// 			</Button>
	// 		);
	// 	};
	//
	// // Higher-order component to add the custom button to the Excerpt panel
	// 	const withCustomExcerptButton = (OriginalComponent) => (props) => {
	// 		return (
	// 			<Fragment>
	// 				<OriginalComponent {...props} />
	// 				<div>
	// 					<CustomButton />
	// 				</div>
	// 			</Fragment>
	// 		);
	// 	};
	//
	// // Apply the filter to extend the Excerpt panel
	// 	addFilter(
	// 		'editor.PostFeaturedImage',
	// 		'custom-excerpt-button/with-custom-excerpt-button',
	// 		withCustomExcerptButton,
	// 	);

	// Wait for the Gutenberg editor to initialize
	wp.domReady( () => {
		// Define a function to add the custom link to the excerpt panel
		const addGenerateExcerptWithAI = () => {
			// Get the excerpt panel
			const excerptPanel = document.querySelector( '.editor-post-excerpt' );

			// Check if the excerpt panel exists and the custom link hasn't been added
			if ( excerptPanel && ! document.querySelector( '.elementor-generate-excerpt-with-ai-link' ) ) {
				// Create a new link element
				const generateExcerptWithAILink = document.createElement( 'a' );
				// Add a class to the link for styling
				generateExcerptWithAILink.classList.add( 'elementor-generate-excerpt-with-ai-link', 'e-excerpt-ai' );
				// Add text content to the link
				generateExcerptWithAILink.textContent = 'Generate with Elementor AI';
				// Add an event listener to the link
				generateExcerptWithAILink.addEventListener( 'click', ( event ) => {
					event.preventDefault();

					const isRTL = elementorCommon.config.isRTL;

					const rootElement = document.createElement( 'div' );
					document.body.append( rootElement );

					const urlSearchParams = new URLSearchParams( window.location.search );
					elementorCommon.ajax.addRequestConstant( 'editor_post_id', urlSearchParams.get( 'post' ) );

					function onClose() {
						ReactDOM.unmountComponentAtNode( rootElement ); // eslint-disable-line react/no-deprecated
						rootElement.parentNode.removeChild( rootElement );
					}

					// eslint-disable-next-line react/no-deprecated
					ReactDOM.render(
						<GenerateExcerptWithAI onClose={ onClose } />,
						rootElement,
					);
				} );

				// Find the existing link with class "components-external-link"
				const existingExcerptLink = excerptPanel.querySelector( '.components-external-link' );
				// Create a div element to wrap the existing link
				const existingExcerptLinkWrapper = document.createElement( 'div' );
				existingExcerptLinkWrapper.classList.add( 'existing-excerpt-link-wrapper' );

				// Append the existing link to the wrapper
				if ( existingExcerptLink ) {
					existingExcerptLinkWrapper.appendChild( existingExcerptLink );
					// Append the wrapper to the excerpt panel
					excerptPanel.appendChild( existingExcerptLinkWrapper );
					// Append the new link before the wrapper
					excerptPanel.insertBefore( generateExcerptWithAILink, existingExcerptLinkWrapper );
				} else {
					// Append the new link to the excerpt panel
					excerptPanel.appendChild( generateExcerptWithAILink );
				}

				// Create the <i> element with the class "eicon-ai"
				const iconElement = document.createElement( 'i' );
				iconElement.classList.add( 'eicon-ai', 'e-excerpt-ai' );
				excerptPanel.insertBefore( iconElement, generateExcerptWithAILink );

				// Add the custom styles to the document head
				const style = `<style>
				.eicon-ai:before {
				  content: "\e9be";
				}
				.eicon-ai {
					padding-right: 0.5em;
				}
				.e-excerpt-ai,
				a.e-excerpt-ai:hover {
					color: #C00BB9;
				}
				.elementor-generate-excerpt-with-ai-link {
				  cursor: pointer;
				  font-family: inherit;
				  font-size: inherit;
				}
				.elementor-generate-excerpt-with-ai-link:hover {
				  text-decoration: underline;
				}
				.existing-excerpt-link-wrapper {
				  padding-top: 0.6em;
				  display: flex;
				  flex-direction: column;
				}
			</style>`;
				const styleElement = document.createElement( 'style' );
				styleElement.innerHTML = style;
				document.head.appendChild( styleElement );
			}
		};

		// Add the custom link to the excerpt panel when the editor sidebar is rendered
		wp.data.subscribe( () => {
			const isSidebarOpened = wp.data.select( 'core/edit-post' ).isEditorPanelOpened( 'post-excerpt' );
			if ( isSidebarOpened ) {
				setTimeout( function() {
					addGenerateExcerptWithAI();
				}, 1 );
			}
		} );
	} );

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
				this.handleIframe();
			}

			if ( ! $( '#elementor-editor' ).length ) {
				self.cache.$editorPanel = $( $( '#elementor-gutenberg-panel' ).html() );
				let editorButtonParent = self.cache.$gutenberg.find( '.block-editor-writing-flow' );
				if ( ! editorButtonParent.length ) {
					editorButtonParent = self.cache.$gutenberg.find( '.is-desktop-preview' );
				}

				self.cache.$gurenbergBlockList = editorButtonParent;
				self.cache.$gurenbergBlockList.append( self.cache.$editorPanel );

				self.cache.$editorPanelButton = self.cache.$editorPanel.find( '#elementor-go-to-edit-page-link' );

				self.cache.$editorPanelButton.on( 'click', function( event ) {
					event.preventDefault();

					self.handleEditButtonClick();
				} );
			}
		},

		handleIframe() {
			this.hideIframeContent();
			this.buildPanelTopBar();
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

		buildPanelTopBar() {
			var self = this;

			if ( ! $( '#elementor-edit-mode-button' ).length && this.isElementorMode ) {
				self.cache.$editorBtnTop = $( $( '#elementor-gutenberg-button-tmpl' ).html() );
				self.cache.$gutenberg.find( '.edit-post-header-toolbar' ).append( self.cache.$editorBtnTop );

				$( '#elementor-edit-mode-button' ).on( 'click', function( event ) {
					event.preventDefault();

					self.handleEditButtonClick( false );
				} );
			}
		},

		handleEditButtonClick( withAnimation = true ) {
			var self = this;

			if ( withAnimation ) {
				self.animateLoader();
			}

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

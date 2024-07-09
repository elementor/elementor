import ReactUtils from 'elementor-utils/react';
import App from './app';
import { __ } from '@wordpress/i18n';
import AIExcerpt from './ai-excerpt';
import useFeaturedImagePrompt from './hooks/use-featured-image-prompt';
import { AIMediaGenerateApp } from '../media-library/componenets';
import { RequestIdsProvider } from './context/requests-ids';
import React from 'react';

export default class AiBehavior extends Marionette.Behavior {
	initialize() {
		this.type = 'text';
		this.controlType = 'text';
		this.buttonLabel = __( 'Write with AI', 'elementor' );
		this.editButtonLabel = __( 'Edit with AI', 'elementor' );
		this.isLabelBlock = false;
		this.additionalOptions = {};
		this.context = {};
		this.config = window.ElementorAiConfig;
	}

	ui() {
		return {
			aiButton: '.e-ai-button',
		};
	}

	events() {
		return {
			'click @ui.aiButton': 'onAiButtonClick',
		};
	}

	getTextualContent() {
		const pageTextContent = [];

		// Use elementorFrontend to loop through all the elements in the Elementor editor
		const clonedCurrentLayout = window.elementor.$previewContents[ 0 ]?.cloneNode( true );
		clonedCurrentLayout.querySelectorAll( '.elementor-editor-element-settings, #elementor-add-new-section, .elementor-add-section-inner, header, footer' )
			.forEach( ( handle ) => handle.remove() );

		const walkDOM = ( node, ancestorOfElementorElement = false ) => {
			ancestorOfElementorElement = node.classList?.contains( 'elementor-element' ) || ancestorOfElementorElement;
			// Check if the node type is TEXT_NODE
			if ( Node.TEXT_NODE === node.nodeType && ancestorOfElementorElement ) {
				const cleanText = ( node.textContent ?? '' ).trim()
					.replace( /\t+/g, '\t' )
					.replace( /\n+/g, '\n' )
					.replace( /\s+/g, ' ' );
				if ( cleanText ) {
					pageTextContent.push( cleanText );
				}
			} else {
				// If not a text node, iterate over its child nodes
				node.childNodes.forEach( ( child ) => walkDOM( child, ancestorOfElementorElement ) );
			}
		};

		walkDOM( clonedCurrentLayout );

		// Trim any extra whitespace
		return pageTextContent.join( '\n' );
	}

	onAiButtonClick( event ) {
		event.stopPropagation();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';

		const isRTL = elementorCommon.config.isRTL;

		const rootElement = document.createElement( 'div' );
		document.body.append( rootElement );

		window.elementorAiCurrentContext = this.getOption( 'context' );

		const { unmount } = ReactUtils.render( this.getElementToRender( rootElement, colorScheme, isRTL ), rootElement );
		this.unmount = unmount;
	}

	getElementToRender( rootElement, colorScheme, isRTL ) {
		const onClose = () => {
			this.handleClose();
			rootElement.remove();
		};

		if ( 'post_featured_image' === this.options.context.controlName ) {
			const FEATURED_IMAGE_RATIO = '4:3';
			return (
				<AIMediaGenerateApp
					onClose={ onClose }
					predefinedPrompt={ this.getTextualContent() }
					textToImageHook={ useFeaturedImagePrompt }
					getControlValue={ this.getOption( 'getControlValue' ) }
					setControlValue={ this.getOption( 'setControlValue' ) }
					initialSettings={ { aspectRatio: FEATURED_IMAGE_RATIO } }
				/>
			);
		}

		if ( 'excerpt' === this.getOption( 'type' ) ) {
			return (
				<RequestIdsProvider>
					<AIExcerpt
						onClose={ onClose }
						currExcerpt={ this.getOption( 'getControlValue' )() }
						updateExcerpt={ this.getOption( 'setControlValue' ) }
						postTextualContent={ this.getTextualContent() }
					/>
				</RequestIdsProvider>
			);
		}
		return (
			<App
				type={ this.getOption( 'type' ) }
				controlType={ this.getOption( 'controlType' ) }
				getControlValue={ this.getOption( 'getControlValue' ) }
				setControlValue={ this.getOption( 'setControlValue' ) }
				additionalOptions={ this.getOption( 'additionalOptions' ) }
				onClose={ onClose }
				colorScheme={ colorScheme }
				isRTL={ isRTL }
			/>
		);
	}

	handleClose() {
		if ( this.unmount ) {
			this.unmount();
		}
	}

	getAiButtonLabel() {
		const defaultValue = this.getOption( 'additionalOptions' )?.defaultValue;
		const currentValue = this.getOption( 'getControlValue' )();
		const isMedia = 'media' === this.getOption( 'type' );
		const isDefaultValue = ( ! isMedia && defaultValue === currentValue ) || ( isMedia && currentValue?.url === defaultValue?.url );

		return isDefaultValue ? this.getOption( 'buttonLabel' ) : this.getOption( 'editButtonLabel' );
	}

	onRender() {
		const isPromotion = ! this.config.is_get_started;
		const buttonLabel = this.getAiButtonLabel();

		const $button = jQuery( '<button>', {
			class: 'e-ai-button',
		} );

		if ( ! isPromotion ) {
			$button.addClass( 'e-active' );
		}

		$button.html( '<i class="eicon-ai"></i>' );

		if ( this.getOption( 'isLabelBlock' ) && isPromotion ) {
			$button.append( ' ' + buttonLabel );
		} else {
			$button.tipsy( {
				gravity: 's',
				title() {
					return buttonLabel;
				},
			} );
		}

		let $wrap = this.$el.find( '.elementor-control-responsive-switchers' );
		if ( ! $wrap.length ) {
			$wrap = this.$el.find( '.elementor-control-title' );
		}

		$wrap.after(
			$button,
		);
	}
}

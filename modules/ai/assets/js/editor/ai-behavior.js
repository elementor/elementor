import ReactUtils from 'elementor-utils/react';
import App from './app';
import { __ } from '@wordpress/i18n';
import PromotionDialog from './components/promotion-dialog';

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

	onAiButtonClick( event ) {
		event.stopPropagation();

		const colorScheme = elementor?.getPreferences?.( 'ui_theme' ) || 'auto';

		const isRTL = elementorCommon.config.isRTL;

		const rootElement = document.createElement( 'div' );
		document.body.append( rootElement );

		window.elementorAiCurrentContext = this.getOption( 'context' );

		const { unmount } = ReactUtils.render( (
			<App
				type={ this.getOption( 'type' ) }
				controlType={ this.getOption( 'controlType' ) }
				getControlValue={ this.getOption( 'getControlValue' ) }
				setControlValue={ this.getOption( 'setControlValue' ) }
				additionalOptions={ this.getOption( 'additionalOptions' ) }
				controlView={ this.getOption( 'controlView' ) }
				onClose={ () => {
					unmount();
					rootElement.remove();
				} }
				colorScheme={ colorScheme }
				isRTL={ isRTL }
			/>
		), rootElement );
	}

	getAiButtonLabel() {
		const defaultValue = this.getOption( 'additionalOptions' )?.defaultValue;
		const currentValue = this.getOption( 'getControlValue' )();
		const isMedia = 'media' === this.getOption( 'type' );
		const isDefaultValue = ( ! isMedia && defaultValue === currentValue ) || ( isMedia && currentValue?.url === defaultValue?.url );

		return isDefaultValue ? this.getOption( 'buttonLabel' ) : this.getOption( 'editButtonLabel' );
	}

	getPromotionTexts( controlType ) {
		switch ( controlType ) {
			case 'textarea':
				return {
					header: "Writer's block? Never again!",
					contentText: 'Elementor AI can draft your initial content and help you beat the blank page.',
				};
			case 'media':
				return {
					header: 'Unleash your creativity.',
					contentText: `With Elementor AI, you can generate any image you'd like for your website.`,
				};
			case 'code':
				return {
					header: 'Let the elves take care of it.',
					contentText: 'Elementor AI can help you write code faster and more efficiently.',
				};
			default:
				return {};
		}
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

		setTimeout( () => {
			const rootBox = $button[ 0 ].getBoundingClientRect();
			const promotionRootElement = this.createRootElementRelativeToAiButton( rootBox );

			const controlType = this.view.model.get( 'type' );
			const promotionTexts = this.getPromotionTexts( controlType );

			document.body.appendChild( promotionRootElement );
			const { unmount } = ReactUtils.render( (
				<PromotionDialog introductionKey={ `ai-promotion-${ controlType }` }
					header={ promotionTexts.header }
					contentText={ promotionTexts.contentText }
					onClose={ () => {
						unmount();
					} }
					onClick={ () => {
						unmount();
						$button.trigger( 'click' );
					} }
				/>
			), promotionRootElement );
		}, 1000 );
	}

	createRootElementRelativeToAiButton( rootBox ) {
		const promotionRootElement = document.createElement( 'div' );
		promotionRootElement.style.position = 'absolute';
		promotionRootElement.style.top = ( rootBox.top - 30 ) + 'px';
		promotionRootElement.style.left = ( rootBox.left + rootBox.width + 30 ) + 'px';
		return promotionRootElement;
	}
}

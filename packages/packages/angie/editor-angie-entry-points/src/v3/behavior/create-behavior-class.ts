import { getGenerateWithAngieLabel } from '../../labels';
import type {
	AngieBehaviorView,
	BehaviorJQueryElement,
	GetButtonLabelArgs,
	MarionetteBehaviorConstructor,
} from '../types';
import { openV3ControlFromBehavior } from './open-v3-control';

let cachedBehaviorClass: MarionetteBehaviorConstructor | undefined;

function createAngieControlBehaviorClass(): MarionetteBehaviorConstructor {
	const Marionette = window.Marionette;

	if ( ! Marionette?.Behavior ) {
		throw new Error( 'Marionette is not available' );
	}

	return Marionette.Behavior.extend( {
		ui: {
			aiButton: '.e-ai-button',
		},

		events: {
			'click @ui.aiButton': 'onAiButtonClick',
		},

		onAiButtonClick( this: AngieBehaviorView, event: Event ) {
			event.stopPropagation();
			openV3ControlFromBehavior( this );
		},

		getAiButtonLabel( this: AngieBehaviorView ) {
			const getButtonLabel = this.getOption( 'getButtonLabel' ) as
				| ( ( args: GetButtonLabelArgs ) => string )
				| undefined;

			if ( getButtonLabel ) {
				return getButtonLabel( {
					getControlValue: this.getOption( 'getControlValue' ) as () => unknown,
					additionalOptions: this.getOption(
						'additionalOptions'
					) as GetButtonLabelArgs[ 'additionalOptions' ],
				} );
			}

			return getGenerateWithAngieLabel();
		},

		onRender( this: AngieBehaviorView ) {
			const isPromotion = ! window.ElementorAiConfig?.is_get_started;
			const buttonLabel = this.getAiButtonLabel();

			let buttonClass = 'e-ai-button';

			if ( ! isPromotion ) {
				buttonClass += ' e-active';
			}

			const jQuery = window.jQuery;

			if ( ! jQuery ) {
				return;
			}

			const $button = jQuery( '<button>', {
				class: buttonClass,
			} ) as BehaviorJQueryElement;

			$button.html( '<i class="eicon-ai"></i>' );

			const isLabelBlock = this.getOption( 'isLabelBlock' ) as boolean;
			if ( isLabelBlock && isPromotion ) {
				$button.append( ' ' + buttonLabel );
			} else {
				$button.tipsy?.( {
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

			$wrap.after( $button );
		},
	} );
}

export function getAngieControlBehaviorClass(): MarionetteBehaviorConstructor {
	if ( ! cachedBehaviorClass ) {
		cachedBehaviorClass = createAngieControlBehaviorClass();
	}

	return cachedBehaviorClass;
}

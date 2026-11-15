import { openAngieInAgentMode } from '@elementor/editor-mcp';

import { getGenerateWithAngieLabel } from '../labels';

type MarionetteBehaviorConstructor = new () => Record<string, unknown>;

type BehaviorJQueryElement = {
	html: ( markup: string ) => BehaviorJQueryElement;
	addClass: ( className: string ) => BehaviorJQueryElement;
	append: ( text: string ) => BehaviorJQueryElement;
	tipsy?: ( options: { gravity: string; title: () => string } ) => void;
};

type BehaviorDomQuery = {
	length: number;
	after: ( element: BehaviorJQueryElement ) => void;
	find: ( selector: string ) => BehaviorDomQuery;
};

type AngieBehaviorView = {
	getOption: ( key: string ) => unknown;
	$el: BehaviorDomQuery;
	getAiButtonLabel: () => string;
};

let cachedBehaviorClass: MarionetteBehaviorConstructor | undefined;

function createAngieControlBehaviorClass(): MarionetteBehaviorConstructor {
	const Marionette = ( window as { Marionette?: { Behavior: { extend: ( proto: Record<string, unknown> ) => MarionetteBehaviorConstructor } } } ).Marionette;

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

			try {
				const buildPrompt = this.getOption( 'buildPrompt' ) as ( args: Record<string, unknown> ) => string;
				const prompt = buildPrompt( {
					type: this.getOption( 'type' ),
					controlType: this.getOption( 'controlType' ),
					getControlValue: this.getOption( 'getControlValue' ),
					context: this.getOption( 'context' ) || {},
					additionalOptions: this.getOption( 'additionalOptions' ),
				} );

				openAngieInAgentMode( prompt );
			} catch ( error ) {
				// eslint-disable-next-line no-console
				console.error( 'Failed to open Angie for V3 control:', error );
			}
		},

		getAiButtonLabel( this: AngieBehaviorView ) {
			const getButtonLabel = this.getOption( 'getButtonLabel' ) as
				| ( ( args: { getControlValue: () => unknown; additionalOptions?: Record<string, unknown> } ) => string )
				| undefined;

			if ( getButtonLabel ) {
				return getButtonLabel( {
					getControlValue: this.getOption( 'getControlValue' ) as () => unknown,
					additionalOptions: this.getOption( 'additionalOptions' ) as Record<string, unknown> | undefined,
				} );
			}

			return getGenerateWithAngieLabel();
		},

		onRender( this: AngieBehaviorView ) {
			const config = ( window as { ElementorAiConfig?: { is_get_started?: boolean | string } } ).ElementorAiConfig;
			const isPromotion = ! config?.is_get_started;
			const buttonLabel = this.getAiButtonLabel();

			let buttonClass = 'e-ai-button';

			if ( ! isPromotion ) {
				buttonClass += ' e-active';
			}

			const jQuery = ( window as { jQuery?: ( tag: string, attrs?: Record<string, string> ) => BehaviorJQueryElement } ).jQuery;
			const $button = jQuery!( '<button>', {
				class: buttonClass,
			} );

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
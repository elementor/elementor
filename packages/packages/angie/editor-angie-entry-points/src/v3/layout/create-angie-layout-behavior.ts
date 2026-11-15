import { __ } from '@wordpress/i18n';

import type { AngieV3LayoutPromptContext } from '../../prompts';
import { getExtendedWindow, type MarionetteBehaviorConstructor } from '../types';
import { openAngieForV3Layout } from './open-angie-layout';

let cachedAddSectionBehavior: MarionetteBehaviorConstructor | undefined;

export function getAngieAddSectionLayoutBehaviorClass(): MarionetteBehaviorConstructor {
	if ( ! cachedAddSectionBehavior ) {
		cachedAddSectionBehavior = createAngieAddSectionLayoutBehaviorClass();
	}

	return cachedAddSectionBehavior;
}

function createAngieAddSectionLayoutBehaviorClass(): MarionetteBehaviorConstructor {
	const { Marionette } = getExtendedWindow();

	if ( ! Marionette?.Behavior ) {
		throw new Error( 'Marionette is not available' );
	}

	return Marionette.Behavior.extend( {
		ui: {
			aiButton: '.e-ai-layout-button',
			addTemplateButton: '.elementor-add-template-button',
		},

		events: {
			'click @ui.aiButton': 'onAiButtonClick',
		},

		onAiButtonClick( event: Event ) {
			event.stopPropagation();

			const legacyContext = this.getOption( 'context' ) as { documentType?: string } | undefined;
			const layoutContext = this.getOption( 'layoutContext' ) as AngieV3LayoutPromptContext | undefined;

			openAngieForV3Layout(
				layoutContext || {
					mode: 'new-layout',
					documentType: legacyContext?.documentType,
					at: ( this.view as { getOption?: ( key: string ) => unknown } )?.getOption?.( 'at' ) as
						| number
						| null
						| undefined,
				}
			);
		},

		onRender() {
			const { jQuery } = getExtendedWindow();

			if ( ! jQuery ) {
				return;
			}

			const $button = jQuery( '<button>', {
				type: 'button',
				class: 'e-ai-layout-button elementor-add-section-area-button e-button-primary',
				title: __( 'Build with AI', 'elementor' ),
				'aria-label': __( 'Build with AI', 'elementor' ),
			} );

			$button.html( `
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<div class="e-ai-layout-button--sparkle"></div>
			<i class="eicon-ai" aria-hidden="true"></i>
		` );

			this.ui.addTemplateButton.after( $button );
		},
	} );
}

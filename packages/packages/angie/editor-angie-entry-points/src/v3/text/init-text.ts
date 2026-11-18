import { __ } from '@wordpress/i18n';

import { buildAngieV3TextPrompt } from '../../prompts';
import { registerV3AngieControl } from '../registry';

const ANGIE_TEXT_AI_TYPES = [ 'text', 'textarea', 'wysiwyg' ];

/** ED-26124 — Replace V3 Text AI modal with Angie. */
export function initV3TextControls(): void {
	registerV3AngieControl( {
		types: ANGIE_TEXT_AI_TYPES,
		buildPrompt: ( { controlType, getControlValue, context } ) =>
			buildAngieV3TextPrompt( {
				elementId: context.elementId,
				controlName: context.controlName,
				controlType: controlType || context.controlType || 'text',
				currentValue: typeof getControlValue === 'function' ? getControlValue() : context.controlValue,
			} ),
		getButtonLabel: ( { getControlValue, additionalOptions } ) => {
			const defaultValue = additionalOptions?.defaultValue;
			const currentValue = getControlValue();
			const isDefaultValue = defaultValue === currentValue;
			return isDefaultValue ? __( 'Write with AI', 'elementor' ) : __( 'Edit with AI', 'elementor' );
		},
	} );
}

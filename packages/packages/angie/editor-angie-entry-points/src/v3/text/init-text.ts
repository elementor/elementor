import { __ } from '@wordpress/i18n';

import { registerV3AngieControl } from '../registry';
import { buildAngieTextPrompt } from './text-prompts';

const ANGIE_TEXT_AI_TYPES = [ 'text', 'textarea', 'wysiwyg' ];

export function initV3TextControls(): void {
	registerV3AngieControl( {
		types: ANGIE_TEXT_AI_TYPES,
		buildPrompt: ( { controlType, getControlValue, context } ) =>
			buildAngieTextPrompt( {
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

import { __ } from '@wordpress/i18n';

import { buildAngieV3CodePrompt } from '../../prompts';
import { registerV3AngieControl } from '../registry';

export function initV3CodeControls(): void {
	registerV3AngieControl( {
		types: [ 'code' ],
		buildPrompt: ( { controlType, getControlValue, context, additionalOptions } ) =>
			buildAngieV3CodePrompt( {
				elementId: context.elementId,
				controlName: context.controlName,
				controlType: controlType || context.controlType || 'code',
				language:
					'string' === typeof additionalOptions?.codeLanguage ? additionalOptions.codeLanguage : undefined,
				currentValue: typeof getControlValue === 'function' ? getControlValue() : context.controlValue,
			} ),
		getButtonLabel: () => __( 'Code with AI', 'elementor' ),
	} );
}

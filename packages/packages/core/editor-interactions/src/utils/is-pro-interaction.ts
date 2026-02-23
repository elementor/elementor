import { getInteractionsControlOptions, type InteractionsControlType } from '../interactions-controls-registry';
import type { InteractionItemPropValue } from '../types';
import { extractString } from '../utils/prop-value-utils';

export function isProInteraction( interaction: InteractionItemPropValue ): boolean {
	const value = interaction.value;
	const trigger = extractString( value.trigger );
	const easing = extractString( value.animation.value.config?.value.easing );

	const checks: Array< [ string, string ] > = [
		[ 'trigger', trigger ],
		[ 'easing', easing ],
	];

	return checks.some( ( [ controlType, controlValue ] ) => {
		const supportedOptions = getInteractionsControlOptions( controlType as InteractionsControlType );
		// If no options registered (empty array), skip - the control doesn't filter by options
		return supportedOptions.length > 0 && ! supportedOptions.includes( controlValue );
	} );
}

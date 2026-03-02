import { getInteractionsControlOptions, type InteractionsControlType } from '../interactions-controls-registry';
import type { InteractionItemPropValue } from '../types';
import { extractBoolean, extractString } from '../utils/prop-value-utils';

export function isSupportedInteraction( interaction: InteractionItemPropValue ): boolean {
	const value = interaction.value;

	const replay = extractBoolean( value.animation.value.config?.value.replay );
	if ( true === replay ) {
		return hasSupport( 'replay', 'yes' );
	}

	const trigger = extractString( value.trigger );
	const easing = extractString( value.animation.value.config?.value.easing );
	const effect = extractString( value.animation.value.effect );

	const checks: Array< [ string, string ] > = [
		[ 'trigger', trigger ],
		[ 'easing', easing ],
		[ 'effect', effect ],
	];

	return checks.every( ( [ controlType, controlValue ] ) => {
		if ( controlValue === '' || controlValue === null ) {
			return true;
		}
		return hasSupport( controlType, controlValue );
	} );
}

function hasSupport( controlType: string, controlValue: string ) {
	const supportedOptions = getInteractionsControlOptions( controlType as InteractionsControlType );

	if ( 1 > supportedOptions.length ) {
		return true;
	}

	return supportedOptions.includes( controlValue );
}

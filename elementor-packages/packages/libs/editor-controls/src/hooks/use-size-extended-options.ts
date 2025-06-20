import { useMemo } from 'react';
import { type ExtendedOption } from '@elementor/editor-controls';
import { isExperimentActive } from '@elementor/editor-v1-adapters';

const EXPERIMENT_ID = 'e_v_3_30';

export function useSizeExtendedOptions( options: ExtendedOption[], disableCustom: boolean ) {
	return useMemo( () => {
		const isVersion330Active = isExperimentActive( EXPERIMENT_ID );
		const shouldDisableCustom = ! isVersion330Active || disableCustom;
		const extendedOptions = [ ...options ];

		if ( ! shouldDisableCustom && ! extendedOptions.includes( 'custom' ) ) {
			extendedOptions.push( 'custom' );
		} else if ( options.includes( 'custom' ) ) {
			extendedOptions.splice( extendedOptions.indexOf( 'custom' ), 1 );
		}

		return extendedOptions;
	}, [ options, disableCustom ] );
}

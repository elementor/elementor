import { useMemo } from 'react';
import { type ExtendedOption } from '@elementor/editor-controls';

export function useSizeExtendedOptions( options: ExtendedOption[], disableCustom: boolean ) {
	return useMemo( () => {
		const extendedOptions = [ ...options ];

		if ( ! disableCustom && ! extendedOptions.includes( 'custom' ) ) {
			extendedOptions.push( 'custom' );
		} else if ( options.includes( 'custom' ) ) {
			extendedOptions.splice( extendedOptions.indexOf( 'custom' ), 1 );
		}

		return extendedOptions;
	}, [ options, disableCustom ] );
}

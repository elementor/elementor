import { useEffect, useState } from 'react';
import { type SizePropValue } from '@elementor/editor-props';

import { EXTENDED_UNITS } from '../utils/resolve-size-value';

type SizeValue = SizePropValue[ 'value' ];

type UseUnitSyncProps = {
	sizeValue: SizeValue;
	setUnit: ( unit: SizeValue[ 'unit' ] ) => void;
	persistWhen: () => boolean;
};

type ExtendedUnit = ( typeof EXTENDED_UNITS )[ keyof typeof EXTENDED_UNITS ];

export const useUnitSync = ( { sizeValue, setUnit, persistWhen }: UseUnitSyncProps ) => {
	const [ state, setState ] = useState( sizeValue.unit );

	useEffect( () => {
		if ( sizeValue.unit !== state ) {
			setState( sizeValue.unit );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ sizeValue.unit, sizeValue.size ] );

	const isExtendedUnit = ( value: SizeValue[ 'unit' ] ): value is ExtendedUnit => {
		return Object.values( EXTENDED_UNITS ).includes( value as ExtendedUnit );
	};

	const setInternalValue = ( newUnit: SizeValue[ 'unit' ] ) => {
		setState( newUnit );

		if ( isExtendedUnit( newUnit ) || persistWhen() ) {
			setUnit( newUnit );
		}
	};

	return [ state, setInternalValue ] as const;
};

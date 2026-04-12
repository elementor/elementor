import { useEffect, useState } from 'react';

import { EXTENDED_UNITS } from '../utils/resolve-size-value';

type UseUnitSyncProps< U > = {
	unit: U;
	setUnit: ( unit: U ) => void;
	persistWhen: () => boolean;
};

type ExtendedUnit = ( typeof EXTENDED_UNITS )[ keyof typeof EXTENDED_UNITS ];

export const useUnitSync = < U >( { unit, setUnit, persistWhen }: UseUnitSyncProps< U > ) => {
	const [ state, setState ] = useState( unit );

	useEffect( () => {
		if ( unit !== state ) {
			setState( unit );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ unit ] );

	const isExtendedUnit = ( value: U ): value is ExtendedUnit & U => {
		return Object.values( EXTENDED_UNITS ).includes( value as ExtendedUnit );
	};

	const setInternalValue = ( newUnit: U ) => {
		setState( newUnit );

		if ( isExtendedUnit( newUnit ) || persistWhen() ) {
			setUnit( newUnit );
		}
	};

	return [ state, setInternalValue ] as const;
};

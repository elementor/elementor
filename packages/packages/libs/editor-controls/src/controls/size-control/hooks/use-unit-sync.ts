import { useEffect, useState } from 'react';

type UseUnitSyncProps< U > = {
	unit: U;
	setUnit: ( unit: U ) => void;
	persistWhen: () => boolean;
};

export const useUnitSync = < U >( { unit, setUnit, persistWhen }: UseUnitSyncProps< U > ) => {
	const [ state, setState ] = useState( unit );

	useEffect( () => {
		if ( unit !== state ) {
			setState( unit );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ unit ] );

	const setInternalValue = ( newUnit: U ) => {
		setState( newUnit );

		if ( persistWhen() ) {
			setUnit( newUnit );
		}
	};

	return [ state, setInternalValue ] as const;
};

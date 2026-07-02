import { useEffect, useState } from 'react';
import { type SizePropValue } from '@elementor/editor-props';

import { isExtendedUnit } from '../utils/is-extended-unit';

type SizeValue = SizePropValue[ 'value' ];

type UseUnitSyncProps = {
	sizeValue: SizeValue;
	setUnit: ( unit: SizeValue[ 'unit' ] ) => void;
	persistWhen: () => boolean;
};

export const useUnitSync = ( { sizeValue, setUnit, persistWhen }: UseUnitSyncProps ) => {
	const [ state, setState ] = useState( sizeValue.unit );

	useEffect( () => {
		if ( sizeValue.unit !== state ) {
			setState( sizeValue.unit );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ sizeValue.unit, sizeValue.size ] );

	const setInternalValue = ( newUnit: SizeValue[ 'unit' ] ) => {
		setState( newUnit );

		if ( isExtendedUnit( newUnit ) || persistWhen() ) {
			setUnit( newUnit );
		}
	};

	return [ state, setInternalValue ] as const;
};

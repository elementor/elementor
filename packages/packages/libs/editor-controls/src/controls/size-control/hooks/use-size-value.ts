import { useMemo } from 'react';
import { type SizePropValue } from '@elementor/editor-props';

import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type SizeUnit } from '../types';
import { DEFAULT_SIZE, DEFAULT_SIZE_UNIT, resolveSizeValue } from '../utils/resolve-size-value';

type SizeValue = SizePropValue[ 'value' ];

type UseSizeValueProps< T, U > = {
	value: T | null;
	onChange: ( value: T | null ) => void;
	units: U[];
	defaultUnit?: U;
};

export const useSizeValue = < T extends SizeValue, U extends SizeUnit >( {
	value,
	onChange,
	units,
	defaultUnit,
}: UseSizeValueProps< T, U > ) => {
	const resolvedValue = useMemo(
		() => resolveSizeValue( value, { units, defaultUnit } ),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ value?.size, value?.unit, defaultUnit ]
	);

	const [ sizeValue, setSizeValue ] = useSyncExternalState< T >( {
		external: resolvedValue as T,
		setExternal: ( newState ) => onChange( newState ), // TODO we will need to handle options, meta if context need them
		persistWhen: ( next ) => hasChanged( next, resolvedValue as T ),
		fallback: () => ( { size: DEFAULT_SIZE, unit: defaultUnit ?? DEFAULT_SIZE_UNIT } ) as T,
	} );

	const setSize = ( newSize: string ) => {
		const trimmed = newSize.trim();
		const parsed = Number( trimmed );

		const newState = {
			...sizeValue,
			size: trimmed && ! isNaN( parsed ) ? parsed : null,
		};

		setSizeValue( newState );
	};

	const setUnit = ( unit: SizeValue[ 'unit' ] ) => {
		setSizeValue( { ...sizeValue, unit } );
	};

	return {
		size: sizeValue.size,
		unit: sizeValue.unit,
		setSize,
		setUnit,
	};
};

const hasChanged = ( next?: SizeValue | null, current?: SizeValue | null ): boolean => {
	return next?.size !== current?.size || next?.unit !== current?.unit;
};

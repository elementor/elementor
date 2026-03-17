import { useMemo } from 'react';
import { type SizePropValue } from '@elementor/editor-props';

import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type SetSizeValue, type SizeUnit } from '../types';
import { isExtendedUnit } from '../utils/is-extended-unit';
import { createDefaultSizeValue, resolveSizeOnUnitChange, resolveSizeValue } from '../utils/resolve-size-value';

type SizeValue = SizePropValue[ 'value' ];

type UseSizeValueProps< T, U > = {
	value: T | null;
	setValue: SetSizeValue< T >;
	units: U[];
	defaultUnit?: U;
};

export const useSizeValue = < T extends SizeValue, U extends SizeUnit >( {
	value,
	setValue,
	units,
	defaultUnit,
}: UseSizeValueProps< T, U > ) => {
	const resolvedValue = useMemo(
		() => resolveSizeValue( value, { units, defaultUnit } ) as T,
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ value?.size, value?.unit, defaultUnit ]
	);

	const [ sizeValue, setSizeValue ] = useSyncExternalState< T >( {
		external: resolvedValue,
		setExternal: ( newState, options, meta ) => {
			// Do we need to just pass the size and not care about the null
			if ( newState !== null ) {
				setValue( newState, options, meta );
			}
		},
		persistWhen: ( next ) => hasChanged( next, resolvedValue ),
		fallback: () => createDefaultSizeValue( units, defaultUnit ),
	} );

	const setSize = ( newSize: string, isInputValid = true ) => {
		if ( isExtendedUnit( sizeValue.unit ) ) {
			return;
		}

		const trimmed = newSize.trim();
		const parsed = Number( trimmed );

		const newState = {
			...sizeValue,
			size: trimmed && ! isNaN( parsed ) ? parsed : '',
		};

		setSizeValue( newState, undefined, { validation: () => isInputValid } );
	};

	const setUnit = ( unit: SizeValue[ 'unit' ] ) => {
		setSizeValue( { unit, size: resolveSizeOnUnitChange( sizeValue.size, unit ) } as T );
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

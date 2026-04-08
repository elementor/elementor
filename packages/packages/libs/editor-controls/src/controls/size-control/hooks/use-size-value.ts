import { useMemo } from 'react';
import { type SizePropValue } from '@elementor/editor-props';

import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type SetSizeValue, type SizeUnit } from '../types';
import { isExtendedUnit } from '../utils/is-extended-unit';
import { createDefaultSizeValue, resolveSizeOnUnitChange, resolveSizeValue } from '../utils/resolve-size-value';
import { useUnitSync } from './use-unit-sync';

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
			if ( newState !== null ) {
				setValue( newState, options, meta );
			}
		},
		persistWhen: ( next ) => hasChanged( next, resolvedValue ),
		fallback: () => createDefaultSizeValue( units, defaultUnit ),
	} );

	const [ unit, setUnit ] = useUnitSync( {
		unit: sizeValue?.unit,
		setUnit: ( newUnit ) => {
			setSizeValue( {
				unit: newUnit,
				size: resolveSizeOnUnitChange( sizeValue.size, newUnit ),
			} as T );
		},
		persistWhen: () => {
			return Boolean( sizeValue.size ) || sizeValue.size !== '';
		},
	} );

	const setSize = ( newSize: string, isInputValid = true ) => {
		if ( isExtendedUnit( sizeValue.unit ) ) {
			return;
		}

		const trimmed = newSize.trim();
		const parsed = Number( trimmed );

		const newState = {
			unit,
			size: trimmed && ! isNaN( parsed ) ? parsed : '',
		} as T;

		setSizeValue( newState, undefined, { validation: () => isInputValid } );
	};

	return {
		size: sizeValue.size,
		setSize,
		unit,
		setUnit,
	};
};

const hasChanged = ( next?: SizeValue | null, current?: SizeValue | null ): boolean => {
	return next?.size !== current?.size || next?.unit !== current?.unit;
};

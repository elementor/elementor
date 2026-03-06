import { useMemo } from 'react';
import { type SizePropValue } from '@elementor/editor-props';

import { useSyncExternalState } from '../../../hooks/use-sync-external-state';
import { type SizeUnit } from '../types';
import { isExtendedUnit } from '../utils/is-extended-unit';
import { createDefaultSizeValue, resolveSizeOnUnitChange, resolveSizeValue } from '../utils/resolve-size-value';

type SizeValue = SizePropValue[ 'value' ];

type UseSizeValueProps< T, U > = {
	value: T | null;
	onChange: ( value: T ) => void;
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
		setExternal: ( newState ) => {
			// TODO we need to check behaviour that low level doesn't set to null only the high level components size component
			// This will fix the issue of if size is empty string '' it gets sends to the model
			// but on blur the size component set to null.
			// But we need to test this behaviour
			if ( newState !== null ) {
				onChange( newState );
			}
		}, // TODO we will need to handle options, meta if context need them
		persistWhen: ( next ) => hasChanged( next, resolvedValue as T ),
		fallback: () => createDefaultSizeValue< T >( defaultUnit ),
	} );

	const setSize = ( newSize: string ) => {
		if ( isExtendedUnit( sizeValue.unit ) ) {
			return;
		}

		const trimmed = newSize.trim();
		const parsed = Number( trimmed );

		const newState = {
			...sizeValue,
			size: trimmed && ! isNaN( parsed ) ? parsed : '',
		};

		setSizeValue( newState );
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

import type { Unit } from '@elementor/editor-controls';
import { type SizePropValue } from '@elementor/editor-props';

import { useSyncExternalState } from '../hooks/use-sync-external-state';

const DEFAULT_UNIT = 'px';

const DEFAULT_SIZE = '';

export const useSizeValue = < T extends SizePropValue[ 'value' ] >(
	externalValue: T,
	onChange: ( value: T ) => void,
	defaultUnit?: Unit
) => {
	const [ sizeValue, setSizeValue ] = useSyncExternalState< T >( {
		external: externalValue,
		setExternal: ( newState ) => {
			if ( newState !== null ) {
				onChange( newState as T );
			}
		},
		persistWhen: ( newState ) => differsFromExternal( newState as T, externalValue ),
		fallback: () => ( { size: DEFAULT_SIZE, unit: defaultUnit ?? DEFAULT_UNIT } ) as unknown as T,
	} );

	const setSize = ( value: string ) => {
		const newState = {
			...sizeValue,
			size: value.trim() === '' ? null : Number( value ),
		};

		setSizeValue( newState );
	};

	const setUnit = ( unit: SizePropValue[ 'value' ][ 'unit' ] ) => {
		const newState = {
			...sizeValue,
			unit,
		};

		setSizeValue( newState );
	};

	return {
		size: sizeValue.size,
		unit: sizeValue.unit,
		setSize,
		setUnit,
	};
};

const differsFromExternal = ( newState?: SizePropValue[ 'value' ], externalState?: SizePropValue[ 'value' ] ) => {
	return newState?.size !== externalState?.size || newState?.unit !== externalState?.unit;
};

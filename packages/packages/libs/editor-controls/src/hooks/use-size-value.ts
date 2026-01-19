import { SizePropValue } from '@elementor/editor-props';
import { useSyncExternalState } from '../hooks/use-sync-external-state';

const DEFAULT_UNIT = 'px';

export const useSizeValue = <T extends SizePropValue['value']> (
	externalValue: T,
	onChange: ( value: T ) => void,
) => {
	const [ sizeValue, setSizeValue ] = useSyncExternalState<T>( {
		external: externalValue,
		setExternal: ( newState ) => onChange( newState as T ),
		persistWhen: ( newState ) => shouldPersist( newState as T, externalValue ),
		fallback: () => ( { unit: DEFAULT_UNIT, size: 0 } ) as T,
	} );

	const setSize = ( value: string) => {
		const newState = {
			...sizeValue,
			size: value.trim() === '' ? null : Number( value )
		};

		setSizeValue( newState );
	};

	const setUnit = ( unit: SizePropValue['value']['unit'] ) => {
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
		setUnit
	}
}

const shouldPersist = (
	newState: SizePropValue['value'],
	externalState: SizePropValue['value']
) => {
	return newState.size !== externalState.size || newState.unit !== externalState.unit
}

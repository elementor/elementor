import { SizePropValue } from '@elementor/editor-props';
import { useState } from 'react';

export const useSizeValue = <T extends SizePropValue['value']> (
	propValue: T,
	onChange: ( value: T ) => void,
	defaultUnit: SizePropValue['value']['unit']
) => {
	const [ sizeValue, setSizeValue ] = useState< T >( {
		...propValue,
		unit: propValue.unit ?? defaultUnit,
	} );

	// useEffect( () => {
	//
	// 	if ( sizeValue.size !== propValue.size || sizeValue.unit !== propValue.unit ) {
	//
	// 	}
	// }, [ sizeValue, propValue.unit, propValue.size, onChange ] )

	const setSize = ( value: string) => {
		const newState = {
			...sizeValue,
			size: value.trim() === '' ? null : Number( value )
		};

		setSizeValue( newState );
		onChange( newState );
	};

	const setUnit = ( unit: SizePropValue['value']['unit'] ) => {
		const newState = {
			...sizeValue,
			unit,
		};

		setSizeValue( newState );
		onChange( newState );
	};

	return {
		size: sizeValue.size,
		unit: sizeValue.unit,
		setSize,
		setUnit
	}
}

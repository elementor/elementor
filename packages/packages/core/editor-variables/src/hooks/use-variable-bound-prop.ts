import { useBoundProp } from '@elementor/editor-controls';
import { type PropValue } from '@elementor/editor-props';

import { useVariableType } from '../context/variable-type-context';

type BoundProp = ReturnType< typeof useBoundProp< PropValue > >;

export const useVariableBoundProp = (): ReturnType< typeof useBoundProp< string > > => {
	const { propTypeUtil } = useVariableType();
	const boundProp = useBoundProp( propTypeUtil );

	return {
		...boundProp,
		setValue: ( value: PropValue ) => resolveBoundPropAndSetValue( value, boundProp as BoundProp ),
		value: boundProp.value ?? boundProp.placeholder,
	};
};

export const resolveBoundPropAndSetValue = ( value: PropValue, boundProp: BoundProp ) => {
	const propValue = unwrapValue( boundProp.value );
	const placeholder = unwrapValue( boundProp.placeholder );
	const newValue = unwrapValue( value );

	if ( ! propValue && placeholder === newValue ) {
		return boundProp.setValue( null );
	}

	return boundProp.setValue( value );
};

const unwrapValue = ( input: PropValue ): PropValue => {
	if ( typeof input === 'string' ) {
		return input;
	}

	if ( input && typeof input === 'object' && 'value' in input ) {
		return input.value as PropValue;
	}

	return null;
};

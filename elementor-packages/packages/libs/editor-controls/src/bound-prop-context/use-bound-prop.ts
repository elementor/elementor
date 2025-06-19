import { useState } from 'react';
import {
	type CreateOptions,
	type PropKey,
	type PropType,
	type PropTypeUtil,
	type PropValue,
} from '@elementor/editor-props';

import { MissingPropTypeError } from './errors';
import { type SetValue } from './prop-context';
import { type PropKeyContextValue, usePropKeyContext } from './prop-key-context';

type UseBoundProp< TValue extends PropValue > = {
	bind: PropKey;
	setValue: SetValue< TValue | null >;
	value: TValue;
	propType: PropType;
	placeholder?: TValue;
	path: PropKey[];
	restoreValue: () => void;
	disabled?: boolean;
};

export function useBoundProp< T extends PropValue = PropValue, P extends PropType = PropType >(): PropKeyContextValue<
	T,
	P
>;

export function useBoundProp< TKey extends string, TValue extends PropValue >(
	propTypeUtil: PropTypeUtil< TKey, TValue >
): UseBoundProp< TValue >;

export function useBoundProp< TKey extends string, TValue extends PropValue >(
	propTypeUtil?: PropTypeUtil< TKey, TValue >
) {
	const propKeyContext = usePropKeyContext();

	const { isValid, validate, restoreValue } = useValidation( propKeyContext.propType );

	// allow using the hook without a propTypeUtil, with no modifications or validations.
	if ( ! propTypeUtil ) {
		return propKeyContext;
	}

	function setValue( value: TValue | null, options: CreateOptions, meta: { bind?: PropKey } ) {
		if ( ! validate( value ) ) {
			return;
		}

		if ( value === null ) {
			return propKeyContext?.setValue( null, options, meta );
		}

		return propKeyContext?.setValue( propTypeUtil?.create( value, options ), {}, meta );
	}

	const propType = resolveUnionPropType( propKeyContext.propType, propTypeUtil.key );

	const value = propTypeUtil.extract( propKeyContext.value ?? propType.default ?? null );
	const placeholder = propTypeUtil.extract( propKeyContext.placeholder ?? null );

	return {
		...propKeyContext,
		propType,
		setValue,
		value: isValid ? value : null,
		restoreValue,
		placeholder,
	};
}

const useValidation = ( propType: PropType ) => {
	const [ isValid, setIsValid ] = useState( true );

	// If the value does not pass the prop type validation, set the isValid state to false.
	// This will prevent the value from being set in the model, and its fallback will be used instead.
	const validate = ( value: PropValue | null ) => {
		let valid = true;

		if ( propType.settings.required && value === null ) {
			valid = false;
		}

		setIsValid( valid );

		return valid;
	};

	const restoreValue = () => setIsValid( true );

	return {
		isValid,
		setIsValid,
		validate,
		restoreValue,
	};
};

// utils
const resolveUnionPropType = ( propType: PropType, key: string ): PropType => {
	let resolvedPropType = propType;

	if ( propType.kind === 'union' ) {
		resolvedPropType = propType.prop_types[ key ];
	}

	if ( ! resolvedPropType ) {
		throw new MissingPropTypeError( { context: { key } } );
	}

	return resolvedPropType;
};

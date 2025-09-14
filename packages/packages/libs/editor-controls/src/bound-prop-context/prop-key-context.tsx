import * as React from 'react';
import { createContext, useContext } from 'react';
import {
	type ArrayPropType,
	type ArrayPropValue,
	type CreateOptions,
	type ObjectPropType,
	type ObjectPropValue,
	type PropKey,
	type PropType,
	type PropValue,
} from '@elementor/editor-props';

import { HookOutsideProviderError, MissingPropTypeError, UnsupportedParentError } from './errors';
import { type SetValue, usePropContext } from './prop-context';

export type PropKeyContextValue< T, P > = {
	bind: PropKey;
	setValue: SetValue< T >;
	value: T;
	propType: P;
	placeholder?: T;
	path: PropKey[];
	isDisabled?: ( propType: PropType ) => boolean | undefined;
	disabled?: boolean;
};

const PropKeyContext = createContext< PropKeyContextValue< PropValue, PropType > | null >( null );

type PropKeyProviderProps = React.PropsWithChildren< {
	bind: PropKey;
} >;

export const PropKeyProvider = ( { children, bind }: PropKeyProviderProps ) => {
	const { propType } = usePropContext();

	if ( ! propType ) {
		throw new MissingPropTypeError( { context: { bind } } );
	}

	if ( propType.kind === 'array' ) {
		return <ArrayPropKeyProvider bind={ bind }>{ children }</ArrayPropKeyProvider>;
	}

	if ( propType.kind === 'object' ) {
		return <ObjectPropKeyProvider bind={ bind }>{ children }</ObjectPropKeyProvider>;
	}

	throw new UnsupportedParentError( { context: { propType } } );
};

const ObjectPropKeyProvider = ( { children, bind }: PropKeyProviderProps ) => {
	const context = usePropContext< ObjectPropValue[ 'value' ], ObjectPropType >();
	const { path } = useContext( PropKeyContext ) ?? {};

	const setValue: SetValue< PropValue > = ( value, options, meta ) => {
		const newValue = {
			...context.value,
			[ bind ]: value,
		};

		return context?.setValue( newValue, options, { ...meta, bind } );
	};

	const value = context.value?.[ bind ];
	const placeholder = context.placeholder?.[ bind ];

	const propType = context.propType.shape[ bind ];

	return (
		<PropKeyContext.Provider
			value={ { ...context, value, setValue, placeholder, bind, propType, path: [ ...( path ?? [] ), bind ] } }
		>
			{ children }
		</PropKeyContext.Provider>
	);
};

const ArrayPropKeyProvider = ( { children, bind }: PropKeyProviderProps ) => {
	const context = usePropContext< ArrayPropValue[ 'value' ], ArrayPropType >();
	const { path } = useContext( PropKeyContext ) ?? {};

	const setValue = ( value: PropValue, options?: CreateOptions ) => {
		const newValue = [ ...( context.value ?? [] ) ];

		newValue[ Number( bind ) ] = value;

		return context?.setValue( newValue, options, { bind } );
	};

	const value = context.value?.[ Number( bind ) ];

	const propType = context.propType.item_prop_type;

	return (
		<PropKeyContext.Provider
			value={ { ...context, value, setValue, bind, propType, path: [ ...( path ?? [] ), bind ] } }
		>
			{ children }
		</PropKeyContext.Provider>
	);
};

export const usePropKeyContext = () => {
	const context = useContext( PropKeyContext );

	if ( ! context ) {
		throw new HookOutsideProviderError( {
			context: { hook: 'usePropKeyContext', provider: 'PropKeyProvider' },
		} );
	}

	return context;
};

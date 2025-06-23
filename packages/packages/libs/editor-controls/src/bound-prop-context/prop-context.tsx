import * as React from 'react';
import { createContext, useContext } from 'react';
import { type CreateOptions, type PropKey, type PropType, type PropValue } from '@elementor/editor-props';

import { HookOutsideProviderError } from './errors';

type SetValueMeta = {
	bind?: PropKey;
};

export type SetValue< T > = ( value: T, options?: CreateOptions, meta?: SetValueMeta ) => void;

type PropContext< T extends PropValue, P extends PropType > = {
	setValue: SetValue< T >;
	value: T | null;
	propType: P;
	placeholder?: T;
	isDisabled?: ( propType: PropType ) => boolean | undefined;
};

const PropContext = createContext< PropContext< PropValue, PropType > | null >( null );

export type PropProviderProps< T extends PropValue, P extends PropType > = React.PropsWithChildren<
	PropContext< T, P >
>;

export const PropProvider = < T extends PropValue, P extends PropType >( {
	children,
	value,
	setValue,
	propType,
	placeholder,
	isDisabled,
}: PropProviderProps< T, P > ) => {
	return (
		<PropContext.Provider
			value={ {
				value,
				propType,
				setValue: setValue as SetValue< PropValue >,
				placeholder,
				isDisabled,
			} }
		>
			{ children }
		</PropContext.Provider>
	);
};

export const usePropContext = < T extends PropValue, P extends PropType >() => {
	const context = useContext( PropContext ) as PropContext< T, P > | null;

	if ( ! context ) {
		throw new HookOutsideProviderError( {
			context: {
				hook: 'usePropContext',
				provider: 'PropProvider',
			},
		} );
	}

	return context;
};

import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

import { type ComponentOverridablePropValue } from '../prop-types/component-overridable-prop-type';

type OverridablePropData = {
	value: ComponentOverridablePropValue;
};

const OverridablePropContext = createContext< OverridablePropData | null >( null );

export function OverridablePropProvider( { children, ...props }: PropsWithChildren< OverridablePropData > ) {
	return <OverridablePropContext.Provider value={ props }>{ children }</OverridablePropContext.Provider>;
}

export const useOverridablePropValue = () => useContext( OverridablePropContext )?.value;

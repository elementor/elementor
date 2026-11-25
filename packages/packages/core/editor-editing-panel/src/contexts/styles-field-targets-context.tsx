import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type ElementID } from '@elementor/editor-elements';

const Context = createContext< ElementID[] | null >( null );

type Props = PropsWithChildren< {
	elementIds: ElementID[];
} >;

export function StylesFieldTargetsProvider( { children, elementIds }: Props ) {
	return <Context.Provider value={ elementIds }>{ children }</Context.Provider>;
}

export function useStylesFieldTargets() {
	return useContext( Context );
}

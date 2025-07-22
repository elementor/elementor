import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type Element, type ElementType } from '@elementor/editor-elements';

type ContextValue = {
	element: Element;
	elementType: ElementType;
};

const Context = createContext< ContextValue | null >( null );

type Props = PropsWithChildren< ContextValue >;

export function ElementProvider( { children, element, elementType }: Props ) {
	return <Context.Provider value={ { element, elementType } }>{ children }</Context.Provider>;
}

export function useElement() {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useElement must be used within a ElementProvider' );
	}

	return context;
}

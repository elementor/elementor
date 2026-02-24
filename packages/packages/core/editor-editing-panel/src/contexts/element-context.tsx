import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type Element, type ElementType } from '@elementor/editor-elements';
import { type AnyTransformable } from '@elementor/editor-props';

type ContextValue = {
	element: Element;
	elementType: ElementType;
	settings: Record< string, AnyTransformable | null >;
};

const Context = createContext< ContextValue | null >( null );

type Props = PropsWithChildren< ContextValue >;

export function ElementProvider( { children, element, elementType, settings }: Props ) {
	return <Context.Provider value={ { element, elementType, settings } }>{ children }</Context.Provider>;
}

export function useElement() {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useElement must be used within a ElementProvider' );
	}

	return context;
}

export function usePanelElementSetting< TValue = AnyTransformable | null >( propKey: string ) {
	const context = useContext( Context );

	if ( ! context ) {
		throw new Error( 'useElementSetting must be used within a ElementProvider' );
	}

	return ( context.settings[ propKey ] ?? null ) as TValue | null;
}

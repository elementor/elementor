import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type Props } from '@elementor/editor-props';

export type StylesFieldsWrite = ( props: Props, options: { propDisplayName: string } ) => void;

const Context = createContext< StylesFieldsWrite | null >( null );

type ProviderProps = PropsWithChildren< {
	write: StylesFieldsWrite;
} >;

export function StylesFieldsWriteProvider( { children, write }: ProviderProps ) {
	return <Context.Provider value={ write }>{ children }</Context.Provider>;
}

export function useStylesFieldsWrite() {
	return useContext( Context );
}

import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';

type ContextValue = {
	prefix: string;
};

export const Context = createContext< ContextValue | null >( null );

type Props = PropsWithChildren< ContextValue >;

export function SessionStorageProvider( { children, prefix }: Props ) {
	const contextPrefix = useContext( Context )?.prefix ?? '';
	const chainedPrefix = contextPrefix ? `${ contextPrefix }/${ prefix }` : prefix;

	return <Context.Provider value={ { prefix: chainedPrefix } }>{ children }</Context.Provider>;
}

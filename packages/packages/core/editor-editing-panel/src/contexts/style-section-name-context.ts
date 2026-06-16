import { createContext, useContext } from 'react';

const StyleSectionNameContext = createContext< string | null >( null );

export const StyleSectionNameProvider = StyleSectionNameContext.Provider;

export function useStyleSectionName(): string | null {
	return useContext( StyleSectionNameContext );
}

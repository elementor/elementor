import * as React from 'react';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';

type ControlAdornmentsItems = Array< {
	id: string;
	Adornment: ComponentType;
} >;

type ControlAdornmentsContext = {
	items?: ControlAdornmentsItems;
};

const Context = createContext< ControlAdornmentsContext | null >( null );

type ControlAdornmentsProviderProps = PropsWithChildren< ControlAdornmentsContext >;

export const ControlAdornmentsProvider = ( { children, items }: ControlAdornmentsProviderProps ) => (
	<Context.Provider value={ { items } }>{ children }</Context.Provider>
);

export const useControlAdornments = () => {
	const context = useContext( Context );

	return context?.items ?? [];
};

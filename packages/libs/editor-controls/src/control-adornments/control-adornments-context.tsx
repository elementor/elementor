import * as React from 'react';
import { type ComponentType, createContext, type PropsWithChildren, useContext } from 'react';
import { type PropType } from '@elementor/editor-props';

export type AdornmentComponent = ComponentType< { customContext?: { path: string[]; propType: PropType } } >;
type ControlAdornmentsItem = {
	id: string;
	Adornment: AdornmentComponent;
};

type ControlAdornmentsContext = {
	items?: ControlAdornmentsItem[];
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

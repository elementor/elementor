import * as React from 'react';
import { createContext, type PropsWithChildren, useContext } from 'react';
import { type PopupState } from '@elementor/ui';

type MenuContextValue = {
	type: 'toolbar' | 'popover';
	popupState?: PopupState;
};

const MenuContext = createContext< MenuContextValue >( {
	type: 'toolbar',
} );

export function MenuContextProvider( { type, popupState, children }: PropsWithChildren< MenuContextValue > ) {
	return <MenuContext.Provider value={ { type, popupState } }>{ children }</MenuContext.Provider>;
}

export function useMenuContext() {
	return useContext( MenuContext );
}

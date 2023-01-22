import { createContext, ReactNode, useContext } from 'react';

type MenuContextValue = {
    type: 'horizontal' | 'popover';
}

const MenuContext = createContext<MenuContextValue>( { type: 'horizontal' } );

export function MenuContextProvider( { type, children }: MenuContextValue & { children: ReactNode } ) {
	return (
		<MenuContext.Provider value={ { type } }>
			{ children }
		</MenuContext.Provider>
	);
}

export function useMenuContext() {
	return useContext( MenuContext );
}

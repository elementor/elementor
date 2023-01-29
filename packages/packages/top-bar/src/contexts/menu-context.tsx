import { createContext, PropsWithChildren, useContext } from 'react';

type MenuContextValue = {
	type: 'toolbar' | 'popover';
}

const MenuContext = createContext<MenuContextValue>( { type: 'toolbar' } );

export function MenuContextProvider( { type, children }: PropsWithChildren<MenuContextValue> ) {
	return (
		<MenuContext.Provider value={ { type } }>
			{ children }
		</MenuContext.Provider>
	);
}

export function useMenuContext() {
	return useContext( MenuContext );
}

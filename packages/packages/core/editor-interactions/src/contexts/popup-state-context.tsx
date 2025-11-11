import * as React from 'react';
import { createContext, useCallback, useContext, useState } from 'react';

type PopupStateContextType = {
	openByDefault: boolean;
	triggerDefaultOpen: () => void;
	resetDefaultOpen: () => void;
};

const PopupStateContext = createContext< PopupStateContextType | undefined >( undefined );

export const PopupStateProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ openByDefault, setOpenByDefault ] = useState( false );

	const triggerDefaultOpen = useCallback( () => {
		setOpenByDefault( true );
	}, [] );

	const resetDefaultOpen = useCallback( () => {
		setOpenByDefault( false );
	}, [] );

	return (
		<PopupStateContext.Provider value={ { openByDefault, triggerDefaultOpen, resetDefaultOpen } }>
			{ children }
		</PopupStateContext.Provider>
	);
};

export const usePopupStateContext = () => {
	const context = useContext( PopupStateContext );
	if ( ! context ) {
		throw new Error( 'usePopupStateContext must be used within PopupStateProvider' );
	}
	return context;
};

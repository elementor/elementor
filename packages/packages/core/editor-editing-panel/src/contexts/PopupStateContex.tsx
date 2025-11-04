import * as React from 'react';

type PopupStateContextType = {
	openByDefault: boolean;
	triggerDefaultOpen: () => void;
	resetDefaultOpen: () => void;
};

const PopupStateContext = React.createContext< PopupStateContextType | undefined >( undefined );

export const PopupStateProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ openByDefault, setOpenByDefault ] = React.useState( false );

	const triggerDefaultOpen = React.useCallback( () => {
		setOpenByDefault( true );
	}, [] );

	const resetDefaultOpen = React.useCallback( () => {
		setOpenByDefault( false );
	}, [] );

	return (
		<PopupStateContext.Provider value={ { openByDefault, triggerDefaultOpen, resetDefaultOpen } }>
			{ children }
		</PopupStateContext.Provider>
	);
};

export const usePopupStateContext = () => {
	const context = React.useContext( PopupStateContext );
	if ( ! context ) {
		throw new Error( 'usePopupStateContext must be used within PopupStateProvider' );
	}
	return context;
};

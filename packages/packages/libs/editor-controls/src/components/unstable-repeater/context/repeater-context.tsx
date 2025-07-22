import * as React from 'react';
import { createContext, useState } from 'react';

type RepeaterContextType = {
	isOpen: boolean;
	setIsOpen: ( isOpen: boolean ) => void;
};

const RepeaterContext = createContext< RepeaterContextType | null >( null );

export const useRepeaterContext = () => {
	const context = React.useContext( RepeaterContext );

	if ( ! context ) {
		throw new Error( 'useRepeaterContext must be used within a RepeaterContextProvider' );
	}

	return {
		isOpen: context.isOpen,
		setIsOpen: context.setIsOpen,
	};
};

export const RepeaterContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const [ isOpen, setIsOpen ] = useState( false );

	return <RepeaterContext.Provider value={ { isOpen, setIsOpen } }>{ children }</RepeaterContext.Provider>;
};

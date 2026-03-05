import { createContext, useCallback, useContext, useState } from 'react';

interface TrackingContextValue {
	isActive: boolean;
	activate: () => void;
}

const TrackingContext = createContext< TrackingContextValue | null >( null );

interface TrackingProviderProps {
	children: React.ReactNode;
}

export function TrackingProvider( { children }: TrackingProviderProps ) {
	const [ isActive, setIsActive ] = useState( false );
	const activate = useCallback( () => setIsActive( true ), [] );

	const value: TrackingContextValue = {
		isActive,
		activate,
	};

	return <TrackingContext.Provider value={ value }>{ children }</TrackingContext.Provider>;
}

export function useTrackingState(): TrackingContextValue {
	const ctx = useContext( TrackingContext );

	if ( ! ctx ) {
		throw new Error( 'useTrackingState must be used within TrackingProvider' );
	}

	return ctx;
}

import * as React from 'react';
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { __useSelector } from '@elementor/store';

import { selectIsConnected, selectIsGuest } from '../store/selectors';
import { canSendEvents, initializeAndEnableTracking } from './init-tracking';
import { flushQueue } from './onboarding-tracking';

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

	const isConnected = __useSelector( selectIsConnected );
	const isGuest = __useSelector( selectIsGuest );
	const hasActivated = useRef( false );

	useEffect( () => {
		if ( hasActivated.current || isActive || ! isConnected || isGuest ) {
			return;
		}

		if ( canSendEvents() ) {
			hasActivated.current = true;
			initializeAndEnableTracking( ( mp ) => {
				( mp as { set_config?: ( c: object ) => void } )?.set_config?.( {
					api_transport: 'sendbeacon',
				} );
				setIsActive( true );
				flushQueue();
			} );
		}
	}, [ isConnected, isGuest, isActive ] );

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

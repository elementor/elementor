import { createContext, useState, useCallback } from 'react';

export const ConnectStateContext = createContext();

export function ConnectStateProvider( { children } ) {
	const [ isConnected, setIsConnected ] = useState( elementorCommon.config.library_connect.is_connected );
	const [ isConnecting, setIsConnecting ] = useState( false );

	const handleConnectSuccess = useCallback( ( callback ) => {
		setIsConnecting( true );
		setIsConnected( true );
		
		elementorCommon.config.library_connect.is_connected = true;
		
		if ( callback ) {
			callback();
		}
	}, [] );

	const handleConnectError = useCallback( ( callback ) => {
		setIsConnected( false );
		setIsConnecting( false );
		
		elementorCommon.config.library_connect.is_connected = false;
		
		if ( callback ) {
			callback();
		}
	}, [] );

	const setConnecting = useCallback( ( connecting ) => {
		setIsConnecting( connecting );
	}, [] );

	const value = {
		isConnected,
		isConnecting,
		setConnecting,
		handleConnectSuccess,
		handleConnectError,
	};

	return (
		<ConnectStateContext.Provider value={ value }>
			{ children }
		</ConnectStateContext.Provider>
	);
}

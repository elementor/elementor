import { useContext } from 'react';
import { ConnectStateContext } from '../context/connect-state-context';

export default function useConnectState() {
	const context = useContext( ConnectStateContext );
	
	if ( ! context ) {
		throw new Error( 'useConnectState must be used within a ConnectStateProvider' );
	}
	
	return context;
}

import { useEffect, useContext } from 'react';
import { OnboardingContext } from '../context/context';

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );

	const connectSuccessCallback = ( data ) => {
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', 'account', 'completed' );

		elementorCommon.config.library_connect.is_connected = true;
		elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;

		stateToUpdate.isLibraryConnected = true;

		updateState( stateToUpdate );
	};

	useEffect( () => {
		jQuery( props.buttonRef.current ).elementorConnect( {
			success: ( data ) => props.successCallback ? props.successCallback( data ) : connectSuccessCallback( data ),
			error: () => {
				if ( props.errorCallback ) {
					props.errorCallback();
				}
			},
			popup: {
				width: 726,
				height: 534,
			},
		} );
	}, [] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
};

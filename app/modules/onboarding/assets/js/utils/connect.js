import { useEffect, useContext } from 'react';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );

	const connectSuccessCallback = ( event, data ) => {
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', 'account', 'completed' );

		OnboardingEventTracking.updateLibraryConnectConfig( data );

		stateToUpdate.isLibraryConnected = true;

		updateState( stateToUpdate );
	};

	useEffect( () => {
		jQuery( props.buttonRef.current ).elementorConnect( {
			success: ( event, data ) => props.successCallback ? props.successCallback( event, data ) : connectSuccessCallback( event, data ),
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

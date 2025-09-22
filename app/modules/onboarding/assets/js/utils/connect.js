import { useEffect, useContext, useCallback } from 'react';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { buttonRef, successCallback, errorCallback } = props;

	const handleCoreConnectionLogic = useCallback( ( event, data ) => {
		const isTrackingOptedInConnect = data.tracking_opted_in && elementorCommon.config.editor_events;

		OnboardingEventTracking.updateLibraryConnectConfig( data );

		if ( isTrackingOptedInConnect ) {
			elementorCommon.config.editor_events.can_send_events = true;
			OnboardingEventTracking.sendConnectionSuccessEvents( data );
		}
	}, [] );

	const defaultConnectSuccessCallback = useCallback( () => {
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', 'account', 'completed' );
		stateToUpdate.isLibraryConnected = true;
		updateState( stateToUpdate );
	}, [ state, getStateObjectToUpdate, updateState ] );

	useEffect( () => {
		jQuery( buttonRef.current ).elementorConnect( {
			success: ( event, data ) => {
				// Always run the core connection logic first (tracking setup)
				handleCoreConnectionLogic( event, data );

				// Then run custom callback if provided, otherwise use default
				if ( successCallback ) {
					successCallback( event, data );
				} else {
					defaultConnectSuccessCallback();
				}
			},
			error: () => {
				if ( errorCallback ) {
					errorCallback();
				}
			},
			popup: {
				width: 726,
				height: 534,
			},
		} );
	}, [ buttonRef, successCallback, errorCallback, handleCoreConnectionLogic, defaultConnectSuccessCallback ] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
};

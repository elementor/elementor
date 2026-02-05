import { useEffect, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';
import EventDispatcher from './modules/event-dispatcher';

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { buttonRef, successCallback, errorCallback } = props;
	const isInitialized = useRef( false );

	const handleCoreConnectionLogic = useCallback( ( event, data ) => {
		const isTrackingOptedInConnect = data.tracking_opted_in && elementorCommon.config.editor_events;

		OnboardingEventTracking.updateLibraryConnectConfig( data );

		if ( isTrackingOptedInConnect ) {
			elementorCommon.config.editor_events.can_send_events = true;
			EventDispatcher.initializeAndEnableTracking();
			OnboardingEventTracking.sendConnectionSuccessEvents( data );
		}
	}, [] );

	const defaultConnectSuccessCallback = useCallback( () => {
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', 'account', 'completed' );
		stateToUpdate.isLibraryConnected = true;
		updateState( stateToUpdate );
	}, [ state, getStateObjectToUpdate, updateState ] );

	useEffect( () => {
		if ( ! buttonRef.current || isInitialized.current ) {
			return;
		}

		const $button = jQuery( buttonRef.current );

		$button.elementorConnect( {
			success: ( event, data ) => {
				handleCoreConnectionLogic( event, data );

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

		isInitialized.current = true;

		return () => {
			$button.off( 'click' );
			isInitialized.current = false;
		};
	}, [ buttonRef, successCallback, errorCallback, handleCoreConnectionLogic, defaultConnectSuccessCallback ] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
};

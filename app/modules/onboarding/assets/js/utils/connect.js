import { useEffect, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';
import EventDispatcher from './modules/event-dispatcher';

let callbackCounter = 0;

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { buttonRef, successCallback, errorCallback, onClickTracking } = props;
	const successCallbackRef = useRef( successCallback );
	const errorCallbackRef = useRef( errorCallback );
	const onClickTrackingRef = useRef( onClickTracking );
	const callbackIdRef = useRef( null );
	const isInitializedRef = useRef( false );

	successCallbackRef.current = successCallback;
	errorCallbackRef.current = errorCallback;
	onClickTrackingRef.current = onClickTracking;

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
		const buttonElement = buttonRef?.current;
		if ( ! buttonElement || isInitializedRef.current ) {
			return;
		}

		isInitializedRef.current = true;
		callbackCounter++;
		const callbackId = 'cb' + callbackCounter;
		callbackIdRef.current = callbackId;

		const originalHref = buttonElement.getAttribute( 'href' ) || '';
		const connectUrl = originalHref + '&mode=popup&callback_id=' + callbackId;

		const handleSuccess = ( event, data ) => {
			handleCoreConnectionLogic( event, data );

			if ( successCallbackRef.current ) {
				successCallbackRef.current( event, data );
			} else {
				defaultConnectSuccessCallback();
			}
		};

		const handleError = () => {
			if ( errorCallbackRef.current ) {
				errorCallbackRef.current();
			}
		};

		const handleClick = ( event ) => {
			event.preventDefault();

			if ( onClickTrackingRef.current ) {
				onClickTrackingRef.current();
			}

			const popup = window.open(
				connectUrl,
				'elementorConnect',
				'toolbar=no, menubar=no, width=726, height=534, top=200, left=0'
			);

			if ( ! popup ) {
				handleError();
			}
		};

		elementorCommon.elements.$window
			.on( 'elementor/connect/success/' + callbackId, handleSuccess )
			.on( 'elementor/connect/error/' + callbackId, handleError );

		buttonElement.addEventListener( 'click', handleClick );

		return () => {
			if ( callbackIdRef.current ) {
				elementorCommon.elements.$window
					.off( 'elementor/connect/success/' + callbackIdRef.current )
					.off( 'elementor/connect/error/' + callbackIdRef.current );
			}
			buttonElement.removeEventListener( 'click', handleClick );
			isInitializedRef.current = false;
		};
	}, [ buttonRef, handleCoreConnectionLogic, defaultConnectSuccessCallback ] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
	onClickTracking: PropTypes.func,
};

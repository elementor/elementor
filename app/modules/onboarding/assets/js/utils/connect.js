import { useEffect, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';
import EventDispatcher from './modules/event-dispatcher';

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { buttonRef, successCallback, errorCallback } = props;
	const isInitialized = useRef( false );
	const successCallbackRef = useRef( successCallback );
	const errorCallbackRef = useRef( errorCallback );

	console.log( '[Connect] Component render', {
		buttonRefExists: !!buttonRef?.current,
		isInitialized: isInitialized.current,
		successCallbackChanged: successCallbackRef.current !== successCallback,
		errorCallbackChanged: errorCallbackRef.current !== errorCallback,
		successCallbackId: successCallback?.toString().substring(0, 50),
		errorCallbackId: errorCallback?.toString().substring(0, 50),
	} );

	successCallbackRef.current = successCallback;
	errorCallbackRef.current = errorCallback;

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
		console.log( '[Connect] useEffect triggered', {
			buttonRefExists: !!buttonRef.current,
			isInitialized: isInitialized.current,
			buttonRefId: buttonRef.current?.id || buttonRef.current?.className || 'no-id',
			href: buttonRef.current?.href || 'no-href',
			successCallbackId: successCallback?.toString().substring(0, 50),
			errorCallbackId: errorCallback?.toString().substring(0, 50),
			handleCoreConnectionLogicId: handleCoreConnectionLogic?.toString().substring(0, 50),
			defaultConnectSuccessCallbackId: defaultConnectSuccessCallback?.toString().substring(0, 50),
		} );

		if ( ! buttonRef.current || isInitialized.current ) {
			console.log( '[Connect] useEffect skipped', {
				reason: !buttonRef.current ? 'no buttonRef.current' : 'already initialized',
			} );
			return;
		}

		const $button = jQuery( buttonRef.current );
		const originalHref = $button.attr( 'href' );
		console.log( '[Connect] Calling elementorConnect', {
			originalHref,
			buttonElement: buttonRef.current,
		} );

		$button.elementorConnect( {
			success: ( event, data ) => {
				handleCoreConnectionLogic( event, data );

				if ( successCallbackRef.current ) {
					successCallbackRef.current( event, data );
				} else {
					defaultConnectSuccessCallback();
				}
			},
			error: () => {
				if ( errorCallbackRef.current ) {
					errorCallbackRef.current();
				}
			},
			popup: {
				width: 726,
				height: 534,
			},
		} );

		const newHref = $button.attr( 'href' );
		console.log( '[Connect] elementorConnect called', {
			originalHref,
			newHref,
			hrefChanged: originalHref !== newHref,
			callbackIdsInHref: ( newHref.match( /callback_id=cb\d+/g ) || [] ).length,
		} );

		isInitialized.current = true;

		return () => {
			console.log( '[Connect] Cleanup running', {
				buttonRefId: buttonRef.current?.id || buttonRef.current?.className || 'no-id',
			} );
			$button.off( 'click' );
			isInitialized.current = false;
		};
	}, [ buttonRef ] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
};

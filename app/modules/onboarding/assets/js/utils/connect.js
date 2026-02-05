import { useEffect, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';
import EventDispatcher from './modules/event-dispatcher';

const initializedButtons = new WeakMap();

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { buttonRef, successCallback, errorCallback } = props;
	const successCallbackRef = useRef( successCallback );
	const errorCallbackRef = useRef( errorCallback );

	const buttonElement = buttonRef?.current;
	const isButtonInitialized = buttonElement ? initializedButtons.has( buttonElement ) : false;

	console.log( '[Connect] Component render', {
		buttonRefExists: !!buttonElement,
		isButtonInitialized,
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
		const buttonElement = buttonRef.current;
		const buttonId = buttonElement?.id || buttonElement?.getAttribute('data-button-id') || 'no-id';
		const buttonText = buttonElement?.textContent?.trim() || buttonElement?.innerText?.trim() || 'no-text';
		const buttonHref = buttonElement?.href || 'no-href';
		const isButtonInitialized = buttonElement ? initializedButtons.has( buttonElement ) : false;

		console.log( '[Connect] useEffect triggered', {
			buttonRefExists: !!buttonElement,
			isButtonInitialized,
			buttonId,
			buttonText,
			buttonHref: buttonHref.substring(0, 100),
			successCallbackChanged: successCallbackRef.current !== successCallback,
			errorCallbackChanged: errorCallbackRef.current !== errorCallback,
		} );

		if ( ! buttonElement || isButtonInitialized ) {
			console.log( '[Connect] useEffect skipped', {
				reason: !buttonElement ? 'no buttonRef.current' : 'button already initialized',
				buttonId,
				buttonText,
			} );
			return;
		}

		const $button = jQuery( buttonElement );
		const originalHref = $button.attr( 'href' );
		console.log( '[Connect] Calling elementorConnect', {
			buttonId,
			buttonText,
			originalHref: originalHref?.substring(0, 100),
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
		const callbackIds = ( newHref?.match( /callback_id=cb\d+/g ) || [] );
		console.log( '[Connect] elementorConnect called', {
			buttonId,
			buttonText,
			hrefChanged: originalHref !== newHref,
			callbackIdsInHref: callbackIds.length,
			callbackIds: callbackIds,
		} );

		initializedButtons.set( buttonElement, true );

		return () => {
			const cleanupButtonId = buttonRef.current?.id || buttonRef.current?.getAttribute('data-button-id') || 'no-id';
			const cleanupButtonText = buttonRef.current?.textContent?.trim() || buttonRef.current?.innerText?.trim() || 'no-text';
			const wasInitialized = buttonRef.current ? initializedButtons.has( buttonRef.current ) : false;
			console.log( '[Connect] Cleanup running', {
				buttonId: cleanupButtonId,
				buttonText: cleanupButtonText,
				wasInitialized,
			} );
			if ( buttonRef.current ) {
				jQuery( buttonRef.current ).off( 'click' );
				initializedButtons.delete( buttonRef.current );
			}
		};
	}, [ buttonRef ] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
};

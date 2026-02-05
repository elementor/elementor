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
	
	let isButtonInitialized = false;
	let buttonText = 'no-text';
	let buttonId = 'no-id';
	let buttonHref = 'no-href';
	let hasCallbackId = false;
	
	if ( buttonElement ) {
		isButtonInitialized = initializedButtons.has( buttonElement );
		buttonText = buttonElement.textContent?.trim() || buttonElement.innerText?.trim() || 'no-text';
		buttonId = buttonElement.id || buttonElement.getAttribute('data-button-id') || 'no-id';
		buttonHref = buttonElement.href || 'no-href';
		
		const $button = jQuery( buttonElement );
		const hrefAttr = $button.attr( 'href' ) || '';
		hasCallbackId = hrefAttr.includes( 'callback_id=' );
		
		if ( hasCallbackId && ! isButtonInitialized ) {
			initializedButtons.set( buttonElement, true );
			isButtonInitialized = true;
		}
	}

	console.log( '[Connect] Component render', {
		buttonRefExists: !!buttonElement,
		isButtonInitialized,
		hasCallbackId,
		buttonText,
		buttonId,
		buttonHref: buttonHref.substring(0, 80),
		successCallbackChanged: successCallbackRef.current !== successCallback,
		errorCallbackChanged: errorCallbackRef.current !== errorCallback,
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
		if ( ! buttonElement ) {
			return;
		}

		if ( initializedButtons.has( buttonElement ) ) {
			console.log( '[Connect] useEffect skipped - already initialized in WeakMap', {
				buttonText: buttonElement.textContent?.trim() || 'no-text',
			} );
			return;
		}

		initializedButtons.set( buttonElement, true );

		const buttonId = buttonElement?.id || buttonElement?.getAttribute('data-button-id') || 'no-id';
		const buttonText = buttonElement?.textContent?.trim() || buttonElement?.innerText?.trim() || 'no-text';
		const $button = jQuery( buttonElement );
		const originalHref = $button.attr( 'href' ) || '';
		
		const hasCallbackId = originalHref.includes( 'callback_id=' );
		
		let hasJQueryHandlers = false;
		let clickHandlersCount = 0;
		try {
			const events = jQuery._data && jQuery._data( buttonElement, 'events' );
			if ( events?.click ) {
				hasJQueryHandlers = events.click.length > 0;
				clickHandlersCount = events.click.length;
			}
		} catch ( e ) {
		}

		console.log( '[Connect] useEffect triggered', {
			buttonRefExists: true,
			hasCallbackId,
			hasJQueryHandlers,
			clickHandlersCount,
			buttonId,
			buttonText,
			originalHref: originalHref.substring(0, 100),
		} );

		if ( hasCallbackId || hasJQueryHandlers ) {
			console.log( '[Connect] useEffect skipped', {
				reason: hasCallbackId ? 'button already has callback_id in href' : 'button already has jQuery handlers',
				buttonId,
				buttonText,
				handlersCount: clickHandlersCount,
			} );
			return;
		}
		console.log( '[Connect] Calling elementorConnect', {
			buttonId,
			buttonText,
			originalHref: originalHref.substring(0, 100),
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

import { useEffect, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../context/context';
import { OnboardingEventTracking } from './onboarding-event-tracking';
import EventDispatcher from './modules/event-dispatcher';

let callbackCounter = 0;
const initializedButtons = new WeakMap();

export default function Connect( props ) {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { buttonRef, successCallback, errorCallback, onClickTracking } = props;
	const successCallbackRef = useRef( successCallback );
	const errorCallbackRef = useRef( errorCallback );
	const onClickTrackingRef = useRef( onClickTracking );
	const callbackIdRef = useRef( null );

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
		
		console.log( '[Connect] useEffect running', {
			hasButtonRef: !!buttonRef,
			hasButtonElement: !!buttonElement,
			isInitialized: buttonElement ? initializedButtons.has( buttonElement ) : false,
			buttonTag: buttonElement?.tagName,
			buttonHref: buttonElement?.getAttribute( 'href' )?.substring( 0, 100 ),
		} );
		
		if ( ! buttonElement ) {
			console.log( '[Connect] No button element, will retry' );
			const timeoutId = setTimeout( () => {
				const retryElement = buttonRef?.current;
				if ( retryElement && ! initializedButtons.has( retryElement ) ) {
					setupButton( retryElement );
				}
			}, 100 );
			return () => clearTimeout( timeoutId );
		}
		
		if ( initializedButtons.has( buttonElement ) ) {
			console.log( '[Connect] Button already initialized, skipping' );
			return;
		}

		return setupButton( buttonElement );
		
		function setupButton( buttonElement ) {
			initializedButtons.set( buttonElement, true );
			callbackCounter++;
			const callbackId = 'cb' + callbackCounter;
			callbackIdRef.current = callbackId;

			const originalUrl = buttonElement.getAttribute( 'href' ) || buttonElement.getAttribute( 'data-connect-url' ) || '';
			const connectUrl = originalUrl + '&mode=popup&callback_id=' + callbackId;
			
			console.log( '[Connect] Setting up click handler', {
				callbackId,
				connectUrl: connectUrl.substring( 0, 150 ),
				buttonTag: buttonElement.tagName,
			} );

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
				console.log( '[Connect] Button clicked!', { 
					callbackId, 
					connectUrl: connectUrl.substring( 0, 150 ),
				} );
				
				event.preventDefault();
				event.stopPropagation();
				event.stopImmediatePropagation();

				if ( onClickTrackingRef.current ) {
					onClickTrackingRef.current();
				}

				const popup = window.open(
					connectUrl,
					'elementorConnect',
					'toolbar=no, menubar=no, width=726, height=534, top=200, left=0'
				);

				console.log( '[Connect] Popup opened', { popup: !!popup, wasBlocked: !popup } );

				if ( ! popup ) {
					console.log( '[Connect] Popup was blocked, calling error handler' );
					handleError();
				}
				
				return false;
			};

			elementorCommon.elements.$window
				.on( 'elementor/connect/success/' + callbackId, handleSuccess )
				.on( 'elementor/connect/error/' + callbackId, handleError );

			buttonElement.addEventListener( 'click', handleClick, true );
			
			console.log( '[Connect] Click handler attached successfully', {
				hasTarget: buttonElement.hasAttribute( 'target' ),
				hasRel: buttonElement.hasAttribute( 'rel' ),
			} );

			return () => {
				console.log( '[Connect] Cleanup running', { callbackId: callbackIdRef.current } );
				if ( callbackIdRef.current ) {
					elementorCommon.elements.$window
						.off( 'elementor/connect/success/' + callbackIdRef.current )
						.off( 'elementor/connect/error/' + callbackIdRef.current );
				}
				buttonElement.removeEventListener( 'click', handleClick, true );
				initializedButtons.delete( buttonElement );
			};
		}
	}, [ buttonRef ] );

	return null;
}

Connect.propTypes = {
	buttonRef: PropTypes.object.isRequired,
	successCallback: PropTypes.func,
	errorCallback: PropTypes.func,
	onClickTracking: PropTypes.func,
};

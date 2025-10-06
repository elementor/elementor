import { useContext, useEffect, useState, useCallback } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function useThemeSelection() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext );
	const { ajaxState: activateHelloThemeAjaxState, setAjax: setActivateHelloThemeAjaxState } = useAjax();
	const [ helloInstalledInOnboarding, setHelloInstalledInOnboarding ] = useState( false );
	const [ isInstalling, setIsInstalling ] = useState( false );
	const noticeStateSuccess = {
		type: 'success',
		icon: 'eicon-check-circle-o',
		message: __( 'Your site\'s got Hello theme. High-five!', 'elementor' ),
	};
	const [ noticeState, setNoticeState ] = useState( state.isHelloThemeActivated ? noticeStateSuccess : null );
	const [ activeTimeouts, setActiveTimeouts ] = useState( [] );
	const continueWithHelloThemeText = state.isHelloThemeActivated ? __( 'Next', 'elementor' ) : __( 'Continue with Hello Biz Theme', 'elementor' );
	const [ actionButtonText, setActionButtonText ] = useState( continueWithHelloThemeText );
	const navigate = useNavigate();
	const pageId = 'hello';
	const nextStep = elementorAppConfig.onboarding.experiment ? 'chooseFeatures' : 'siteName';

	const goToNextScreen = () => navigate( 'onboarding/' + nextStep );

	useEffect( () => {
		if ( ! helloInstalledInOnboarding && state.isHelloThemeActivated ) {
			const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );
			updateState( stateToUpdate );
			goToNextScreen();
		}

		OnboardingEventTracking.setupAllUpgradeButtons( state.currentStep );
		OnboardingEventTracking.onStepLoad( 2 );
		OnboardingEventTracking.sendExperimentStarted();
	}, [] );

	const resetScreenContent = () => {
		activeTimeouts.forEach( ( timeoutID ) => clearTimeout( timeoutID ) );
		setActiveTimeouts( [] );
		setIsInstalling( false );
		setActionButtonText( continueWithHelloThemeText );
	};

	const onHelloThemeActivationSuccess = useCallback( () => {
		setIsInstalling( false );

		elementorCommon.events.dispatchEvent( {
			event: 'indication prompt',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
				action_state: 'success',
				action: 'hello theme activation',
			},
		} );

		setNoticeState( noticeStateSuccess );
		setActionButtonText( __( 'Next', 'elementor' ) );

		const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );
		stateToUpdate.isHelloThemeActivated = true;
		updateState( stateToUpdate );

		setHelloInstalledInOnboarding( true );

		OnboardingEventTracking.sendStepEndState( 2 );
		goToNextScreen();
	}, [] );

	const onErrorInstallHelloTheme = () => {
		elementorCommon.events.dispatchEvent( {
			event: 'indication prompt',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
				action_state: 'failure',
				action: 'hello theme install',
			},
		} );

		setNoticeState( {
			type: 'error',
			icon: 'eicon-warning',
			message: __( 'There was a problem installing Hello Biz Theme.', 'elementor' ),
		} );

		resetScreenContent();
	};

	const activateHelloTheme = () => {
		setIsInstalling( true );
		updateState( { isHelloThemeInstalled: true } );

		setActivateHelloThemeAjaxState( {
			data: { action: 'elementor_activate_hello_theme' },
		} );
	};

	const installHelloTheme = () => {
		if ( ! isInstalling ) {
			setIsInstalling( true );
		}

		wp.updates.ajax( 'install-theme', {
			slug: 'hello-biz',
			success: () => activateHelloTheme(),
			error: () => onErrorInstallHelloTheme(),
		} );
	};

	const sendNextButtonEvent = () => {
		elementorCommon.events.dispatchEvent( {
			event: 'next',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
			},
		} );
	};

	const handleActionButtonClick = () => {
		OnboardingEventTracking.trackStepAction( 2, 'continue_hello_biz' );
		sendNextButtonEvent();

		if ( state.isHelloThemeActivated ) {
			OnboardingEventTracking.sendStepEndState( 2 );
			goToNextScreen();
		} else if ( state.isHelloThemeInstalled && ! state.isHelloThemeActivated ) {
			activateHelloTheme();
		} else if ( ! state.isHelloThemeInstalled ) {
			installHelloTheme();
		} else {
			OnboardingEventTracking.sendStepEndState( 2 );
			goToNextScreen();
		}
	};

	useEffect( () => {
		if ( isInstalling ) {
			setActionButtonText( (
				<>
					<i className="eicon-loading eicon-animation-spin" aria-hidden="true" />
				</>
			) );
		}

		const actionTextTimeouts = [];

		const timeout4 = setTimeout( () => {
			if ( ! isInstalling ) {
				return;
			}

			setActionButtonText( (
				<>
					<i className="eicon-loading eicon-animation-spin" aria-hidden="true" />
					<span className="e-onboarding__action-button-text">{ __( 'Hold on, this can take a minute...', 'elementor' ) }</span>
				</>
			) );
		}, 4000 );

		actionTextTimeouts.push( timeout4 );

		const timeout30 = setTimeout( () => {
			if ( ! isInstalling ) {
				return;
			}

			setActionButtonText( (
				<>
					<i className="eicon-loading eicon-animation-spin" aria-hidden="true" />
					<span className="e-onboarding__action-button-text">{ __( 'Okay, now we\'re really close...', 'elementor' ) }</span>
				</>
			) );
		}, 30000 );

		actionTextTimeouts.push( timeout30 );
		setActiveTimeouts( actionTextTimeouts );
	}, [ isInstalling ] );

	useEffect( () => {
		if ( 'initial' !== activateHelloThemeAjaxState.status ) {
			if ( 'success' === activateHelloThemeAjaxState.status && activateHelloThemeAjaxState.response?.helloThemeActivated ) {
				onHelloThemeActivationSuccess();
			} else if ( 'error' === activateHelloThemeAjaxState.status ) {
				elementorCommon.events.dispatchEvent( {
					event: 'indication prompt',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						action_state: 'failure',
						action: 'hello theme activation',
					},
				} );

				setNoticeState( {
					type: 'error',
					icon: 'eicon-warning',
					message: __( 'There was a problem activating Hello Biz Theme.', 'elementor' ),
				} );

				resetScreenContent();
			}
		}
	}, [ activateHelloThemeAjaxState.status ] );

	return {
		state,
		isInstalling,
		noticeState,
		actionButtonText,
		pageId,
		nextStep,
		handleActionButtonClick,
	};
}


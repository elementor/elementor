/* eslint-disable @wordpress/i18n-ellipsis */
import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';
import Layout from '../components/layout/layout';
import ThemeSelectionContentA from '../components/theme-selection-content-a';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

const HELLO_THEME_SLUG = 'hello-elementor';

const getContinueButtonText = ( isHelloThemeActivated ) => {
	if ( isHelloThemeActivated ) {
		return __( 'Next', 'elementor' );
	}

	return __( 'Continue with Hello Theme', 'elementor' );
};

export default function HelloTheme() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		{ ajaxState: activateHelloThemeAjaxState, setAjax: setActivateHelloThemeAjaxState } = useAjax(),
		// Allow navigating back to this screen if it was completed in the onboarding.
		[ helloInstalledInOnboarding, setHelloInstalledInOnboarding ] = useState( false ),
		[ isInstalling, setIsInstalling ] = useState( false );

	const noticeStateSuccess = useMemo( () => ( {
		type: 'success',
		icon: 'eicon-check-circle-o',
		message: __( 'Your site\'s got Hello theme. High-five!', 'elementor' ),
	} ), [] );

	const [ noticeState, setNoticeState ] = useState( state.isHelloThemeActivated ? noticeStateSuccess : null );

	const [ activeTimeouts, setActiveTimeouts ] = useState( [] ),
		navigate = useNavigate(),
		pageId = 'hello',
		nextStep = elementorAppConfig.onboarding.experiment ? 'chooseFeatures' : 'siteName',
		goToNextScreen = useCallback( () => navigate( 'onboarding/' + nextStep ), [ navigate, nextStep ] ),
		continueWithHelloThemeText = getContinueButtonText( state.isHelloThemeActivated ),
		[ actionButtonText, setActionButtonText ] = useState( continueWithHelloThemeText );

	/**
	 * Setup
	 *
	 * If Hello Theme is already activated when onboarding starts, This screen is unneeded and is marked as 'completed'
	 * and skipped.
	 */
	useEffect( () => {
		if ( ! helloInstalledInOnboarding && state.isHelloThemeActivated ) {
			const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

			updateState( stateToUpdate );

			goToNextScreen();
		}

		OnboardingEventTracking.setupAllUpgradeButtons( state.currentStep );
		OnboardingEventTracking.onStepLoad( 2 );
	}, [ getStateObjectToUpdate, goToNextScreen, helloInstalledInOnboarding, pageId, state, updateState ] );

	useEffect( () => {
		const updatedButtonText = getContinueButtonText( state.isHelloThemeActivated );
		setActionButtonText( updatedButtonText );
	}, [ state.isHelloThemeActivated ] );

	const resetScreenContent = () => {
		activeTimeouts.forEach( ( timeoutID ) => clearTimeout( timeoutID ) );

		setActiveTimeouts( [] );

		setIsInstalling( false );

		const updatedButtonText = getContinueButtonText( state.isHelloThemeActivated );
		setActionButtonText( updatedButtonText );
	};

	/**
	 * Callbacks
	 */
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

		OnboardingEventTracking.sendThemeInstalled( 'hello' );

		OnboardingEventTracking.sendStepEndState( 2 );
		goToNextScreen();
	}, [ getStateObjectToUpdate, goToNextScreen, noticeStateSuccess, state, updateState ] );

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
			message: __( 'There was a problem installing Hello Theme.', 'elementor' ),
		} );

		resetScreenContent();
	};

	const activateHelloTheme = () => {
		setIsInstalling( true );

		updateState( { isHelloThemeInstalled: true } );

		setActivateHelloThemeAjaxState( {
			data: {
				action: 'elementor_activate_hello_theme',
				theme_slug: HELLO_THEME_SLUG,
			},
		} );
	};

	const installHelloTheme = () => {
		if ( ! isInstalling ) {
			setIsInstalling( true );
		}

		wp.updates.ajax( 'install-theme', {
			slug: HELLO_THEME_SLUG,
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

	/**
	 * Action Button
	 */
	const actionButton = {
		text: actionButtonText,
		role: 'button',
	};

	if ( isInstalling ) {
		actionButton.className = 'e-onboarding__button--processing';
	}

	if ( state.isHelloThemeActivated ) {
		actionButton.onClick = () => {
			sendNextButtonEvent();

			OnboardingEventTracking.sendStepEndState( 2 );
			goToNextScreen();
		};
	} else {
		actionButton.onClick = () => {
			sendNextButtonEvent();

			if ( state.isHelloThemeInstalled && ! state.isHelloThemeActivated ) {
				activateHelloTheme();
			} else if ( ! state.isHelloThemeInstalled ) {
				installHelloTheme();
			} else {
				OnboardingEventTracking.sendStepEndState( 2 );
				goToNextScreen();
			}
		};
	}

	/**
	 * Skip Button
	 */
	const skipButton = {};

	if ( isInstalling ) {
		skipButton.className = 'e-onboarding__button-skip--disabled';
	}

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton.text = __( 'Skip', 'elementor' );
	}

	/**
	 * Set timeouts for updating the 'Next' button text if the Hello Theme installation is taking too long.
	 */
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
					message: __( 'There was a problem activating Hello Theme.', 'elementor' ),
				} );

				// Clear any active timeouts for changing the action button text during installation.
				resetScreenContent();
			}
		}
	}, [ activateHelloThemeAjaxState.status ] );

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<ThemeSelectionContentA
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
			/>
			<div className="e-onboarding__footnote">
				{ __( 'You can switch your theme later on', 'elementor' ) }
			</div>
		</Layout>
	);
}

/* eslint-disable @wordpress/i18n-ellipsis */
import { useContext, useEffect, useState, useCallback } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';
import Layout from '../components/layout/layout';
import ThemeSelectionContentA from '../components/theme-selection-content-a';
import ThemeSelectionContentB from '../components/theme-selection-content-b';
import { OnboardingEventTracking, ONBOARDING_STORAGE_KEYS } from '../utils/onboarding-event-tracking';

export default function HelloTheme() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		{ ajaxState: activateHelloThemeAjaxState, setAjax: setActivateHelloThemeAjaxState } = useAjax(),
		// Allow navigating back to this screen if it was completed in the onboarding.
		[ helloInstalledInOnboarding, setHelloInstalledInOnboarding ] = useState( false ),
		[ isInstalling, setIsInstalling ] = useState( false ),
		[ selectedTheme, setSelectedTheme ] = useState( null ),
		noticeStateSuccess = {
			type: 'success',
			icon: 'eicon-check-circle-o',
			message: __( 'Your site’s got Hello theme. High-five!', 'elementor' ),
		},
		[ noticeState, setNoticeState ] = useState( state.isHelloThemeActivated ? noticeStateSuccess : null ),
		[ activeTimeouts, setActiveTimeouts ] = useState( [] ),
		continueWithHelloThemeText = state.isHelloThemeActivated ? __( 'Next', 'elementor' ) : __( 'Continue with Hello Biz Theme', 'elementor' ),
		[ actionButtonText, setActionButtonText ] = useState( continueWithHelloThemeText ),
		navigate = useNavigate(),
		pageId = 'hello',
		nextStep = elementorAppConfig.onboarding.experiment ? 'chooseFeatures' : 'siteName',
		goToNextScreen = () => navigate( 'onboarding/' + nextStep );

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

	const resetScreenContent = () => {
		// Clear any active timeouts for changing the action button text during installation.
		activeTimeouts.forEach( ( timeoutID ) => clearTimeout( timeoutID ) );

		setActiveTimeouts( [] );

		setIsInstalling( false );

		setActionButtonText( continueWithHelloThemeText );
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
			message: __( 'There was a problem installing Hello Biz Theme.', 'elementor' ),
		} );

		resetScreenContent();
	};

	const activateHelloTheme = () => {
		setIsInstalling( true );

		updateState( { isHelloThemeInstalled: true } );

		const themeSlug = 'hello-theme' === selectedTheme ? 'hello-elementor' : 'hello-biz';

		setActivateHelloThemeAjaxState( {
			data: {
				action: 'elementor_activate_hello_theme',
				theme_slug: themeSlug,
			},
		} );
	};

	const installHelloTheme = () => {
		if ( ! isInstalling ) {
			setIsInstalling( true );
		}

		const themeSlug = 'hello-theme' === selectedTheme ? 'hello-elementor' : 'hello-biz';

		wp.updates.ajax( 'install-theme', {
			slug: themeSlug,
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

	const handleThemeSelection = ( themeSlug ) => {
		setSelectedTheme( themeSlug );

		const themeValue = 'hello-theme' === themeSlug ? 'hello' : 'hellobiz';

		OnboardingEventTracking.trackStepAction( 2, `select_theme_${ themeSlug.replace( '-', '_' ) }`, { theme: themeValue } );
		OnboardingEventTracking.sendThemeChoiceEvent( state.currentStep, themeValue );
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
			OnboardingEventTracking.trackStepAction( 2, 'continue_hello_biz' );
			sendNextButtonEvent();

			OnboardingEventTracking.sendStepEndState( 2 );
			goToNextScreen();
		};
	} else {
		actionButton.onClick = () => {
			OnboardingEventTracking.trackStepAction( 2, 'continue_hello_biz' );
			OnboardingEventTracking.sendHelloBizContinue( state.currentStep );
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
					message: __( 'There was a problem activating Hello Biz Theme.', 'elementor' ),
				} );

				// Clear any active timeouts for changing the action button text during installation.
				resetScreenContent();
			}
		}
	}, [ activateHelloThemeAjaxState.status ] );

	const variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.THEME_SELECTION_VARIANT );
	const ContentComponent = 'B' === variant ? ThemeSelectionContentB : ThemeSelectionContentA;

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<ContentComponent
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
				selectedTheme={ selectedTheme }
				onThemeSelect={ handleThemeSelection }
				onThemeInstallSuccess={ onHelloThemeActivationSuccess }
				onThemeInstallError={ onErrorInstallHelloTheme }
			/>
			<div className="e-onboarding__footnote">
				{ '* ' + __( 'You can switch your theme later on', 'elementor' ) }
			</div>
		</Layout>
	);
}

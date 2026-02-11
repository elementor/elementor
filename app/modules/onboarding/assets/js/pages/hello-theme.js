/* eslint-disable @wordpress/i18n-ellipsis */
import { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { OnboardingContext } from '../context/context';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';
import Layout from '../components/layout/layout';
import ThemeSelectionExperiment202VariantA from '../components/theme-selection-experiment202-variant-a';
import ThemeSelectionExperiment202VariantB from '../components/theme-selection-experiment202-variant-b';
import { OnboardingEventTracking, ONBOARDING_STORAGE_KEYS } from '../utils/onboarding-event-tracking';

const getContinueButtonText = ( isHelloThemeActivated, isVariant202B ) => {
	if ( isHelloThemeActivated ) {
		return __( 'Next', 'elementor' );
	}

	return isVariant202B ? __( 'Install Hello Biz', 'elementor' ) : __( 'Select theme', 'elementor' );
};

export default function HelloTheme() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		{ ajaxState: activateHelloThemeAjaxState, setAjax: setActivateHelloThemeAjaxState } = useAjax(),
		// Allow navigating back to this screen if it was completed in the onboarding.
		[ helloInstalledInOnboarding, setHelloInstalledInOnboarding ] = useState( false ),
		[ isInstalling, setIsInstalling ] = useState( false ),
		[ selectedTheme, setSelectedTheme ] = useState( null );

	const noticeStateSuccess = useMemo( () => ( {
		type: 'success',
		icon: 'eicon-check-circle-o',
		message: __( 'Your site\'s got Hello theme. High-five!', 'elementor' ),
	} ), [] );

	const [ noticeState, setNoticeState ] = useState( state.isHelloThemeActivated ? noticeStateSuccess : null );

	const [ activeTimeouts, setActiveTimeouts ] = useState( [] ),
		[ variant202, setVariant202 ] = useState( null ),
		navigate = useNavigate(),
		pageId = 'hello',
		nextStep = elementorAppConfig.onboarding.experiment ? 'chooseFeatures' : 'siteName',
		goToNextScreen = useCallback( () => navigate( 'onboarding/' + nextStep ), [ navigate, nextStep ] ),
		isVariant202B = 'B' === variant202,
		themeToActivate = selectedTheme || ( isVariant202B ? 'hello-biz' : null ),
		themeSlug = 'hello-theme' === themeToActivate ? 'hello-elementor' : 'hello-biz',
		continueWithHelloThemeText = getContinueButtonText( state.isHelloThemeActivated, isVariant202B ),
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

		const storedVariant202 = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT202_VARIANT );
		setVariant202( storedVariant202 );

		const currentIsVariant202B = 'B' === storedVariant202;

		const shouldAutoSelectHelloBiz = currentIsVariant202B && ! selectedTheme;

		if ( shouldAutoSelectHelloBiz ) {
			setSelectedTheme( 'hello-biz' );
		}
	}, [ getStateObjectToUpdate, goToNextScreen, helloInstalledInOnboarding, pageId, state, updateState, selectedTheme ] );

	useEffect( () => {
		const updatedButtonText = getContinueButtonText( state.isHelloThemeActivated, isVariant202B );
		setActionButtonText( updatedButtonText );
	}, [ state.isHelloThemeActivated, isVariant202B ] );

	const resetScreenContent = () => {
		activeTimeouts.forEach( ( timeoutID ) => clearTimeout( timeoutID ) );

		setActiveTimeouts( [] );

		setIsInstalling( false );

		const updatedButtonText = getContinueButtonText( state.isHelloThemeActivated, isVariant202B );
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

		const installedThemeValue = selectedTheme && 'hello-theme' === selectedTheme ? 'hello' : 'hellobiz';
		OnboardingEventTracking.sendThemeInstalled( installedThemeValue );

		OnboardingEventTracking.sendStepEndState( 2 );
		goToNextScreen();
	}, [ getStateObjectToUpdate, goToNextScreen, noticeStateSuccess, state, updateState, selectedTheme ] );

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

	const handleThemeSelection = ( selectedSlug ) => {
		setSelectedTheme( selectedSlug );

		const themeValue = 'hello-theme' === selectedSlug ? 'hello' : 'hellobiz';

		if ( ! isVariant202B ) {
			OnboardingEventTracking.sendThemeMarked( themeValue );
		}
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

	if ( ! state.isHelloThemeActivated && ! selectedTheme && ! isVariant202B ) {
		actionButton.disabled = true;
		actionButton.className = actionButton.className ? `${ actionButton.className } e-onboarding__button--disabled` : 'e-onboarding__button--disabled';
	}

	if ( state.isHelloThemeActivated ) {
		actionButton.onClick = () => {
			sendNextButtonEvent();

			OnboardingEventTracking.sendStepEndState( 2 );
			goToNextScreen();
		};
	} else {
		actionButton.onClick = () => {
			if ( ! selectedTheme && ! isVariant202B ) {
				return;
			}

			if ( ! themeToActivate ) {
				return;
			}

			if ( ! selectedTheme && isVariant202B ) {
				setSelectedTheme( 'hello-biz' );
			}

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

	const ContentComponent = isVariant202B ? ThemeSelectionExperiment202VariantB : ThemeSelectionExperiment202VariantA;

	const getLayoutClassName = () => {
		if ( isVariant202B ) {
			return 'experiment202-variant-b';
		}
		return '';
	};

	return (
		<Layout pageId={ pageId } nextStep={ nextStep } className={ getLayoutClassName() }>
			<ContentComponent
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
				selectedTheme={ selectedTheme }
				onThemeSelect={ handleThemeSelection }
				onThemeInstallSuccess={ onHelloThemeActivationSuccess }
				onThemeInstallError={ onErrorInstallHelloTheme }
				{ ...( ! isVariant202B && { isInstalling } ) }
			/>
			<div className="e-onboarding__footnote">
				{ isVariant202B
					? __( 'You can switch your theme anytime', 'elementor' )
					: __( 'You can switch your theme later on', 'elementor' )
				}
			</div>
		</Layout>
	);
}

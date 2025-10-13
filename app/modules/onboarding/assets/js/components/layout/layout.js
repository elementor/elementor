import { useRef, useContext, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { OnboardingContext } from '../../context/context';

import Header from './header';
import ProgressBar from '../progress-bar/progress-bar';
import Content from '../../../../../../assets/js/layout/content';
import Connect from '../../utils/connect';
import { OnboardingEventTracking } from '../../utils/onboarding-event-tracking';

function getCurrentStepForTracking( pageId, currentStep ) {
	return pageId || currentStep || 'account';
}

function shouldResetupButtonTracking( buttonRef, pageId, currentStep ) {
	if ( ! buttonRef ) {
		return false;
	}

	const currentStepForTracking = getCurrentStepForTracking( pageId, currentStep );
	const currentTrackedStep = buttonRef.dataset.onboardingStep;

	return currentTrackedStep !== currentStepForTracking;
}

export default function Layout( props ) {
	const { state, updateState } = useContext( OnboardingContext );

	const stepNumber = useMemo( () => {
		return OnboardingEventTracking.getStepNumber( props.pageId );
	}, [ props.pageId ] );

	const goProButtonRef = useRef();

	const setupTopbarUpgradeTracking = useCallback( ( buttonElement ) => {
		if ( ! buttonElement ) {
			return;
		}

		const currentStep = getCurrentStepForTracking( props.pageId, state.currentStep );
		goProButtonRef.current = buttonElement;
		return OnboardingEventTracking.setupSingleUpgradeButton( buttonElement, currentStep );
	}, [ state.currentStep, props.pageId ] );

	const handleTopbarConnectSuccess = useCallback( () => {
		updateState( {
			isLibraryConnected: true,
		} );
	}, [ updateState ] );

	useEffect( () => {
		// Send modal load event for current step.
		elementorCommon.events.dispatchEvent( {
			event: 'modal load',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: props.pageId,
				user_state: elementorCommon.config.library_connect.is_connected ? 'logged' : 'anon',
			},
		} );

		if ( goProButtonRef.current ) {
			setupTopbarUpgradeTracking( goProButtonRef.current );
		}

		updateState( {
			currentStep: props.pageId,
			nextStep: props.nextStep || '',
			proNotice: null,
		} );
	}, [ setupTopbarUpgradeTracking, stepNumber, props.pageId, props.nextStep, updateState ] );

	useEffect( () => {
		if ( shouldResetupButtonTracking( goProButtonRef.current, props.pageId, state.currentStep ) ) {
			setupTopbarUpgradeTracking( goProButtonRef.current );
		}
	}, [ state.currentStep, props.pageId, setupTopbarUpgradeTracking ] );

	const
		headerButtons = [],
		createAccountButton = {
			id: 'create-account',
			text: __( 'Create Account', 'elementor' ),
			hideText: false,
			elRef: useRef(),
			url: elementorAppConfig.onboarding.urls.signUp + elementorAppConfig.onboarding.utms.connectTopBar,
			target: '_blank',
			rel: 'opener',
			onClick: () => {
				OnboardingEventTracking.sendEventOrStore( 'CREATE_MY_ACCOUNT', { currentStep: stepNumber, createAccountClicked: 'topbar' } );

				elementorCommon.events.dispatchEvent( {
					event: 'create account',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						source: 'header',
					},
				} );
			},
		};

	if ( state.isLibraryConnected ) {
		headerButtons.push( {
			id: 'my-elementor',
			text: __( 'My Elementor', 'elementor' ),
			hideText: false,
			icon: 'eicon-user-circle-o',
			url: 'https://my.elementor.com/websites/?utm_source=onboarding-wizard&utm_medium=wp-dash&utm_campaign=my-account&utm_content=top-bar&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
			target: '_blank',
			onClick: () => {
				elementorCommon.events.dispatchEvent( {
					event: 'my elementor click',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						source: 'header',
					},
				} );
			},
		} );
	} else {
		headerButtons.push( createAccountButton );
	}

	if ( ! state.hasPro ) {
		headerButtons.push( {
			id: 'go-pro',
			text: __( 'Upgrade', 'elementor' ),
			hideText: false,
			className: 'eps-button__go-pro-btn',
			url: 'https://elementor.com/pro/?utm_source=onboarding-wizard&utm_campaign=gopro&utm_medium=wp-dash&utm_content=top-bar&utm_term=' + elementorAppConfig.onboarding.onboardingVersion,
			target: '_blank',
			elRef: setupTopbarUpgradeTracking,
			onClick: () => {
				const currentStep = getCurrentStepForTracking( props.pageId, state.currentStep );
				const currentStepNumber = OnboardingEventTracking.getStepNumber( currentStep );
				OnboardingEventTracking.trackStepAction( currentStepNumber, 'upgrade_topbar' );

				elementorCommon.events.dispatchEvent( {
					event: 'go pro',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: currentStep,
					},
				} );
			},
		} );
	}

	return (
		<div className="eps-app__lightbox">
			<div className={ `eps-app e-onboarding ${ props.className || '' }` }>
				{ ! state.isLibraryConnected &&
					<Connect
						buttonRef={ createAccountButton.elRef }
						successCallback={ handleTopbarConnectSuccess }
					/>
				}
				<Header
					title={ __( 'Getting Started', 'elementor' ) }
					buttons={ headerButtons }
					goProButtonRef={ goProButtonRef }
				/>
				<div className={ 'eps-app__main e-onboarding__page-' + props.pageId }>
					<Content className="e-onboarding__content">
						<ProgressBar />
						{ props.children }
					</Content>
				</div>
			</div>
		</div>
	);
}

Layout.propTypes = {
	pageId: PropTypes.string.isRequired,
	nextStep: PropTypes.string,
	className: PropTypes.string,
	children: PropTypes.any.isRequired,
};

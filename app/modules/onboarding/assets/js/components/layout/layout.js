import { useRef, useContext, useEffect, useCallback } from 'react';
import { OnboardingContext } from '../../context/context';

import Header from './header';
import ProgressBar from '../progress-bar/progress-bar';
import Content from '../../../../../../assets/js/layout/content';
import Connect from '../../utils/connect';
import { OnboardingEventTracking } from '../../utils/onboarding-event-tracking';

export default function Layout( props ) {
	const initializeExitTracking = ( stepNumber ) => {
		OnboardingEventTracking.setupWindowCloseTracking( stepNumber );
	};

	const hasHoveredTopbarUpgrade = useRef( false );

	const setupTopbarUpgradeTracking = useCallback( ( buttonElement ) => {
		if ( ! buttonElement ) {
			return;
		}

		const handleMouseEnter = () => {
			hasHoveredTopbarUpgrade.current = true;
		};

		const handleMouseLeave = () => {
			if ( hasHoveredTopbarUpgrade.current ) {
				const stepNumber = getStepNumber( props.pageId );
				OnboardingEventTracking.sendTopUpgrade( stepNumber, 'no_click' );
				hasHoveredTopbarUpgrade.current = false;
			}
		};

		buttonElement.addEventListener( 'mouseenter', handleMouseEnter );
		buttonElement.addEventListener( 'mouseleave', handleMouseLeave );

		return () => {
			buttonElement.removeEventListener( 'mouseenter', handleMouseEnter );
			buttonElement.removeEventListener( 'mouseleave', handleMouseLeave );
		};
	}, [ props.pageId ] );

	useEffect( () => {
		elementorCommon.events.dispatchEvent( {
			event: 'modal load',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: props.pageId,
				user_state: elementorCommon.config.library_connect.is_connected ? 'logged' : 'anon',
			},
		} );

		const stepNumber = getStepNumber( props.pageId );
		initializeExitTracking( stepNumber );

		updateState( {
			currentStep: stepNumber,
			nextStep: props.nextStep || '',
			proNotice: null,
		} );
	}, [ props.pageId ] );

	const getStepNumber = ( pageId ) => {
		const stepMapping = {
			account: 1,
			hello: 2,
			chooseFeatures: 3,
			goodToGo: 4,
		};
		return stepMapping[ pageId ] || 1;
	};

	const { state, updateState } = useContext( OnboardingContext ),
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
				const stepNumber = getStepNumber( props.pageId );
				OnboardingEventTracking.sendTopUpgrade( stepNumber, 'on_topbar' );

				elementorCommon.events.dispatchEvent( {
					event: 'go pro',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
					},
				} );
			},
		} );
	}

	return (
		<div className="eps-app__lightbox">
			<div className="eps-app e-onboarding">
				{ ! state.isLibraryConnected &&
					<Connect
						buttonRef={ createAccountButton.elRef }
					/>
				}
				<Header
					title={ __( 'Getting Started', 'elementor' ) }
					buttons={ headerButtons }
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

import { useRef } from 'react';
import PropTypes from 'prop-types';
import Connect from '../utils/connect';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function AccountContentB( {
	state,
	connectSuccessCallback,
	connectFailureCallback,
	updateState,
	getStateObjectToUpdate,
	navigate,
	nextStep,
	pageId,
} ) {
	const handleConnectClick = () => {
		OnboardingEventTracking.trackStepAction( 1, 'create' );
		OnboardingEventTracking.sendEventOrStore( 'CREATE_MY_ACCOUNT', { currentStep: 1, createAccountClicked: 'main_cta' } );
	};

	const handleGuestClick = () => {
		OnboardingEventTracking.trackStepAction( 1, 'skip' );
		OnboardingEventTracking.sendEventOrStore( 'SKIP', { currentStep: 1 } );
		OnboardingEventTracking.sendStepEndState( 1 );
		OnboardingEventTracking.sendEventOrStore( 'AB_101_START_AS_FREE_USER', { currentStep: 1 } );

		updateState( getStateObjectToUpdate( state, 'steps', pageId, 'skipped' ) );
		navigate( 'onboarding/' + nextStep );
	};
	const actionButtonRef = useRef();

	return (
		<div className="e-onboarding101-variant-b-content">
			<div className="e-onboarding101-variant-b-icon">
				<svg width="104" height="104" viewBox="0 0 104 104" fill="none" xmlns="http://www.w3.org/2000/svg">
					<rect width="104" height="104" rx="24" fill="#FE7AE3" />
					<path fillRule="evenodd" clipRule="evenodd" d="M22.242 71.0334C18.3768 65.2487 16.3137 58.4477 16.3137 51.4904C16.3137 42.1611 20.0198 33.2138 26.6167 26.6169C33.2135 20.0201 42.1609 16.314 51.4902 16.314C58.4474 16.314 65.2484 18.377 71.0332 22.2423C76.8179 26.1075 81.3266 31.6013 83.989 38.029C86.6514 44.4566 87.348 51.5294 85.9907 58.353C84.6334 65.1765 81.2833 71.4444 76.3637 76.3639C71.4442 81.2835 65.1763 84.6337 58.3528 85.991C51.5292 87.3483 44.4564 86.6517 38.0287 83.9892C31.6011 81.3268 26.1073 76.8182 22.242 71.0334ZM42.6974 36.8324H36.8356V66.147H42.6974V36.8324ZM66.1449 36.8324H48.5594V42.6942H66.1449V36.8324ZM66.1449 48.5562H48.5594V54.418H66.1449V48.5562ZM66.1449 60.2852H48.5594V66.147H66.1449V60.2852Z" fill="#91013B" />
				</svg>
			</div>
			<p className="e-onboarding101-variant-b-description e-onboarding101-variant-b-welcome">
				{ __( 'Welcome!', 'elementor' ) }
			</p>
			<h1 className="e-onboarding101-variant-b-title">
				{ __( 'Connect your account to enable your full creative workspace', 'elementor' ) }
			</h1>
			<p className="e-onboarding101-variant-b-description">
				{ __( 'Access beautiful templates, ready-made blocks, and a single dashboard to manage all your sites in one place', 'elementor' ) }
			</p>
			<div className="e-onboarding101-variant-b-buttons">
				<a
					ref={ actionButtonRef }
					href={ elementorAppConfig.onboarding.urls.signUp + elementorAppConfig.onboarding.utms.connectCta }
					className="e-onboarding101-variant-b-button e-onboarding101-variant-b-button--primary"
					role="button"
				>
					{ __( 'Connect your account', 'elementor' ) }
				</a>
				<button
					className="e-onboarding101-variant-b-button e-onboarding101-variant-b-button--secondary"
					onClick={ handleGuestClick }
				>
					{ __( 'Continue as a guest', 'elementor' ) }
				</button>
			</div>
			{ actionButtonRef && ! state.isLibraryConnected &&
				<Connect
					buttonRef={ actionButtonRef }
					successCallback={ ( event, data ) => connectSuccessCallback( event, data ) }
					errorCallback={ connectFailureCallback }
					onClickTracking={ handleConnectClick }
				/>
			}
		</div>
	);
}

AccountContentB.propTypes = {
	state: PropTypes.shape( {
		isLibraryConnected: PropTypes.bool,
	} ).isRequired,
	connectSuccessCallback: PropTypes.func.isRequired,
	connectFailureCallback: PropTypes.func.isRequired,
	updateState: PropTypes.func.isRequired,
	getStateObjectToUpdate: PropTypes.func.isRequired,
	navigate: PropTypes.func.isRequired,
	nextStep: PropTypes.string.isRequired,
	pageId: PropTypes.string.isRequired,
};

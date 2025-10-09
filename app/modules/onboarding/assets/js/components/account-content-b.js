import { useRef } from 'react';
import Connect from '../utils/connect';
import PageContentLayout from './layout/page-content-layout';
import { safeDispatchEvent } from '../utils/utils';
import { OnboardingEventTracking } from '../utils/onboarding-event-tracking';

export default function AccountContentB( { 
	actionButton, 
	skipButton, 
	noticeState, 
	state, 
	connectSuccessCallback, 
	connectFailureCallback, 
	connectReadyCallback,
	updateState,
	getStateObjectToUpdate,
	navigate,
	nextStep,
	pageId
} ) {
	const handleConnectClick = () => {
		OnboardingEventTracking.trackStepAction( 1, 'create' );
		OnboardingEventTracking.sendEventOrStore( 'CREATE_MY_ACCOUNT', { currentStep: 1, createAccountClicked: 'main_cta' } );

		safeDispatchEvent(
			'new_account_connect',
			{
				location: 'plugin_onboarding',
				trigger: elementorCommon.eventsManager?.config?.triggers?.click || 'click',
				step_number: 1,
				step_name: 'account_setup',
				button_text: 'Connect your account',
			},
		);
	};

	const handleGuestClick = () => {
		OnboardingEventTracking.trackStepAction( 1, 'skip' );
		OnboardingEventTracking.sendEventOrStore( 'SKIP', { currentStep: 1 } );
		OnboardingEventTracking.sendStepEndState( 1 );

		safeDispatchEvent(
			'skip_setup',
			{
				location: 'plugin_onboarding',
				trigger: elementorCommon.eventsManager?.config?.triggers?.click || 'click',
				step_number: 1,
				step_name: 'account_setup',
				button_text: 'Continue as a guest',
			},
		);

		updateState( getStateObjectToUpdate( state, 'steps', pageId, 'skipped' ) );
		navigate( 'onboarding/' + nextStep );
	};
	return (
		<PageContentLayout
			image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Account.svg' }
			title={ elementorAppConfig.onboarding.experiment ? __( 'You\'re here!', 'elementor' ) : __( 'You\'re here! Let\'s set things up.', 'elementor' ) }
			secondLineTitle={ elementorAppConfig.onboarding.experiment ? __( ' Let\'s get connected.', 'elementor' ) : '' }
			actionButton={ actionButton }
			skipButton={ skipButton }
			noticeState={ noticeState }
			className="e-onboarding-variant-b-content-layout"
		>
			<div className="e-onboarding-variant-b-content">
				<div className="e-onboarding-variant-b-icon">
					<svg width="104" height="104" viewBox="0 0 104 104" fill="none">
						<circle cx="52" cy="52" r="52" fill="#F3BAFD" />
						<path d="M52 24C36.536 24 24 36.536 24 52C24 67.464 36.536 80 52 80C67.464 80 80 67.464 80 52C80 36.536 67.464 24 52 24Z" fill="#93003F" />
						<path d="M44 52L50 58L60 46" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
					</svg>
				</div>
				<h1 className="e-onboarding-variant-b-title">
					{ __( 'Welcome! Let\'s connect your Elementor account', 'elementor' ) }
				</h1>
				<p className="e-onboarding-variant-b-description">
					{ __( 'You\'ll get access to website templates, ready-made blocks, and a dashboard to manage all your Elementor sites in one place', 'elementor' ) }
				</p>
				<div className="e-onboarding-variant-b-buttons">
					<button
						ref={ actionButton.ref }
						className="e-onboarding-variant-b-button e-onboarding-variant-b-button--primary"
						onClick={ handleConnectClick }
					>
						{ __( 'Connect your account', 'elementor' ) }
					</button>
					<button
						className="e-onboarding-variant-b-button e-onboarding-variant-b-button--secondary"
						onClick={ handleGuestClick }
					>
						{ __( 'Continue as a guest', 'elementor' ) }
					</button>
				</div>
				{ actionButton.ref && ! state.isLibraryConnected &&
					<Connect
						buttonRef={ actionButton.ref }
						successCallback={ ( event, data ) => connectSuccessCallback( event, data ) }
						errorCallback={ connectFailureCallback }
						readyCallback={ connectReadyCallback }
					/>
				}
			</div>
		</PageContentLayout>
	);
}

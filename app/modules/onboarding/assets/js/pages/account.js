import { useRef, useContext, useState, useEffect } from 'react';
import { useNavigate } from '@reach/router';
import { OnboardingContext } from '../context/context';
import Connect from '../utils/connect';
import Layout from '../components/layout/layout';
import AccountContentA from '../components/account-content-a';
import AccountContentB from '../components/account-content-b';
import { safeDispatchEvent } from '../utils/utils';
import { OnboardingEventTracking, ONBOARDING_STORAGE_KEYS } from '../utils/onboarding-event-tracking';

export default function Account() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		[ noticeState, setNoticeState ] = useState( null ),
		nextStep = getNextStep(),
		navigate = useNavigate(),
		pageId = 'account',
		actionButtonRef = useRef(),
		alreadyHaveAccountLinkRef = useRef();

	useEffect( () => {
		if ( ! state.isLibraryConnected ) {
			safeDispatchEvent(
				'view_account_setup',
				{
					location: 'plugin_onboarding',
					trigger: elementorCommon.eventsManager?.config?.triggers?.pageLoaded || 'page_loaded',
					step_number: 1,
					step_name: 'account_setup',
					is_library_connected: state?.isLibraryConnected || false,
				},
			);
		}

		OnboardingEventTracking.setupAllUpgradeButtons( state.currentStep );
		OnboardingEventTracking.onStepLoad( 1 );
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [] );

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip setup', 'elementor' ),
			action: () => {
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
					},
				);

				updateState( getStateObjectToUpdate( state, 'steps', pageId, 'skipped' ) );
				navigate( 'onboarding/' + nextStep );
			},
		};
	}

	let pageTexts = {};

	if ( state.isLibraryConnected ) {
		pageTexts = {
			firstLine: <>{ __( 'To get the most out of Elementor, we\'ll help you take your', 'elementor' ) } <br /> { __( 'first steps:', 'elementor' ) }</>,
			listItems: elementorAppConfig.onboarding.experiment
				? [
					__( 'Set your site\'s theme', 'elementor' ),
					__( 'Choose additional features', 'elementor' ),
					__( 'Choose how to start creating', 'elementor' ),
				] : [
					__( 'Set your site\'s theme', 'elementor' ),
					__( 'Give your site a name & logo', 'elementor' ),
					__( 'Choose how to start creating', 'elementor' ),
				],
		};
	} else {
		pageTexts = elementorAppConfig.onboarding.experiment ? {
			firstLine: <>{ __( 'To get the most of Elementor, we\'ll connect your account.', 'elementor' ) }  <br /> { __( 'Then you can:', 'elementor' ) }</>,
			listItems: [
				__( 'Access dozens of professionally designed templates', 'elementor' ),
				__( 'Manage all your sites from the My Elementor dashboard', 'elementor' ),
				__( 'Unlock tools that streamline your workflow and site setup', 'elementor' ),
			],
		} : {
			firstLine: __( 'To get the most out of Elementor, we\'ll connect your account.', 'elementor' ) +
			' ' + __( 'Then you can:', 'elementor' ),
			listItems: [
				__( 'Choose from countless professional templates', 'elementor' ),
				__( 'Manage your site with our handy dashboard', 'elementor' ),
				__( 'Take part in the community forum, share & grow together', 'elementor' ),
			],
		};
	}

	// If the user is not connected, the on-click action is handled by the <Connect> component, so there is no onclick
	// property.
	const actionButton = {
		role: 'button',
	};

	if ( state.isLibraryConnected ) {
		actionButton.text = __( 'Let\'s do it', 'elementor' );

		actionButton.onClick = () => {
			elementorCommon.events.dispatchEvent( {
				event: 'next',
				version: '',
				details: {
					placement: elementorAppConfig.onboarding.eventPlacement,
					step: state.currentStep,
				},
			} );

			updateState( getStateObjectToUpdate( state, 'steps', pageId, 'completed' ) );

			navigate( 'onboarding/' + nextStep );
		};
	} else {
		actionButton.text = __( 'Start setup', 'elementor' );
		actionButton.href = elementorAppConfig.onboarding.urls.signUp + elementorAppConfig.onboarding.utms.connectCta;
		actionButton.ref = actionButtonRef;
		actionButton.onClick = ( event ) => {
			event.preventDefault();

			OnboardingEventTracking.trackStepAction( 1, 'create' );
			OnboardingEventTracking.sendEventOrStore( 'CREATE_MY_ACCOUNT', { currentStep: 1, createAccountClicked: 'main_cta' } );

			safeDispatchEvent(
				'new_account_connect',
				{
					location: 'plugin_onboarding',
					trigger: elementorCommon.eventsManager?.config?.triggers?.click || 'click',
					step_number: 1,
					step_name: 'account_setup',
					button_text: 'Start setup',
				},
			);
		};
	}

	console.log( '[Account] Component render/re-render' );
	const connectSuccessCallback = () => {
		console.log( '[Account] connectSuccessCallback called' );
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

		stateToUpdate.isLibraryConnected = true;

		updateState( stateToUpdate );

		elementorCommon.events.dispatchEvent( {
			event: 'indication prompt',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
				action_state: 'success',
				action: 'connect account',
			},
		} );

		setNoticeState( {
			type: 'success',
			icon: 'eicon-check-circle-o',
			message: 'Alrighty - your account is connected.',
		} );

		OnboardingEventTracking.sendStepEndState( 1 );
		navigate( 'onboarding/' + nextStep );
	};

	function getNextStep() {
		if ( ! state.isHelloThemeActivated ) {
			return 'hello';
		}

		return elementorAppConfig.onboarding.experiment ? 'chooseFeatures' : 'siteName';
	}

	const connectFailureCallback = () => {
		console.log( '[Account] connectFailureCallback called' );
		elementorCommon.events.dispatchEvent( {
			event: 'indication prompt',
			version: '',
			details: {
				placement: elementorAppConfig.onboarding.eventPlacement,
				step: state.currentStep,
				action_state: 'failure',
				action: 'connect account',
			},
		} );

		OnboardingEventTracking.sendConnectionFailureEvents();

		setNoticeState( {
			type: 'error',
			icon: 'eicon-warning',
			message: __( 'Oops, the connection failed. Try again.', 'elementor' ),
		} );

		navigate( 'onboarding/' + nextStep );
	};

	const experiment101Variant = localStorage.getItem( ONBOARDING_STORAGE_KEYS.EXPERIMENT101_VARIANT );
	const ContentComponent = 'B' === experiment101Variant ? AccountContentB : AccountContentA;

	return (
		<Layout
			pageId={ pageId }
			nextStep={ nextStep }
			className={ 'B' === experiment101Variant ? 'e-onboarding101-variant-b' : '' }
		>
			<ContentComponent
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
				pageTexts={ pageTexts }
				state={ state }
				connectSuccessCallback={ connectSuccessCallback }
				connectFailureCallback={ connectFailureCallback }
				updateState={ updateState }
				getStateObjectToUpdate={ getStateObjectToUpdate }
				navigate={ navigate }
				nextStep={ nextStep }
				pageId={ pageId }
			/>
			{
				! state.isLibraryConnected && 'B' !== experiment101Variant && (
					<div className="e-onboarding__footnote">
						<p>
							{ __( 'Already have an account?', 'elementor' ) + ' ' }
							<a
								ref={ alreadyHaveAccountLinkRef }
								href={ elementorAppConfig.onboarding.urls.connect + elementorAppConfig.onboarding.utms.connectCtaLink }
								onClick={ ( event ) => {
									event.preventDefault();

									OnboardingEventTracking.trackStepAction( 1, 'connect' );
									OnboardingEventTracking.sendEventOrStore( 'STEP1_CLICKED_CONNECT', { currentStep: state.currentStep } );

									safeDispatchEvent(
										'existing_account_connect',
										{
											location: 'plugin_onboarding',
											trigger: elementorCommon.eventsManager?.config?.triggers?.click || 'click',
											step_number: 1,
											step_name: 'account_setup',
											button_text: 'Click here to connect',
										},
									);
								} }
							>
								{ __( 'Click here to connect', 'elementor' ) }
							</a>
						</p>
						<Connect
							buttonRef={ alreadyHaveAccountLinkRef }
							successCallback={ connectSuccessCallback }
							errorCallback={ connectFailureCallback }
						/>
					</div>
				)
			}
		</Layout>
	);
}

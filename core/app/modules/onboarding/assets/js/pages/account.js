import { useRef, useContext, useState, useEffect } from 'react';
import { useNavigate } from '@reach/router';
import useAjax from 'elementor-app/hooks/use-ajax';
import { OnboardingContext } from '../context/context';
import Connect from '../utils/connect';
import Layout from '../components/layout/layout';
import PageContentLayout from '../components/layout/page-content-layout';
import CheckBoxWithLabel from '../components/checkbox-with-label';

export default function Account() {
	const { state, updateState, getStateObjectToUpdate } = useContext( OnboardingContext ),
		[ noticeState, setNoticeState ] = useState( null ),
		[ dataSharingCheckboxState, setDataSharingCheckboxState ] = useState( true ),
		{ ajaxState: dataSharingAjaxState, setAjax: setDataSharingAjaxState } = useAjax(),
		navigate = useNavigate(),
		pageId = 'account',
		nextStep = state.isHelloThemeActivated ? 'siteName' : 'hello',
		actionButtonRef = useRef(),
		alreadyHaveAccountLinkRef = useRef();

	let skipButton;

	if ( 'completed' !== state.steps[ pageId ] ) {
		skipButton = {
			text: __( 'Skip', 'elementor' ),
		};

		// If the user skips the "Connect" step, but did check the Data Sharing checkbox - handle data sharing.
		if ( ! state.isUsageDataShared && dataSharingCheckboxState ) {
			skipButton.action = () => {
				setDataSharingAjaxState( {
					data: { action: 'elementor_update_data_sharing' },
				} );
			};
		}
	}

	let pageTexts = {};

	if ( state.isLibraryConnected ) {
		pageTexts = {
			firstLine: __( 'To get the most out of Elementor, we\'ll help you take your first steps:', 'elementor' ),
			listItems: [
				__( 'Set your site\'s theme', 'elementor' ),
				__( 'Give your site a name & logo', 'elementor' ),
				__( 'Choose how to start creating', 'elementor' ),
			],
		};
	} else {
		pageTexts = {
			firstLine: __( 'To get the most out of Elementor, we’ll connect your account.', 'elementor' ) +
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

			// If connected to Elementor, handle the data sharing permission when the user clicks the Next button.
			if ( ! state.isUsageDataShared && dataSharingCheckboxState ) {
				setDataSharingAjaxState( {
					data: { action: 'elementor_update_data_sharing' },
				} );
			}

			const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

			updateState( stateToUpdate );

			navigate( 'onboarding/' + nextStep );
		};
	} else {
		actionButton.text = __( 'Create my account', 'elementor' );
		actionButton.href = elementorAppConfig.onboarding.urls.signUp + elementorAppConfig.onboarding.utms.connectCta;
		actionButton.ref = actionButtonRef;
		actionButton.onClick = () => {
			elementorCommon.events.dispatchEvent( {
				event: 'create account',
				version: '',
				details: {
					placement: elementorAppConfig.onboarding.eventPlacement,
					contributor: dataSharingCheckboxState,
					source: 'cta',
				},
			} );
		};
	}

	const sendDataSharingRequest = () => {
		setDataSharingAjaxState( {
			data: { action: 'elementor_update_data_sharing' },
		} );
	};

	const connectSuccessCallback = ( data ) => {
		const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'completed' );

		stateToUpdate.isLibraryConnected = true;

		elementorCommon.config.library_connect.is_connected = true;
		elementorCommon.config.library_connect.current_access_level = data.kits_access_level || data.access_level || 0;

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

		// If not connected at onboarding load, handle the data sharing permission after the connect is handled.
		if ( ! state.isUsageDataShared && dataSharingCheckboxState ) {
			sendDataSharingRequest();
		} else {
			navigate( 'onboarding/' + nextStep );
		}
	};

	const connectFailureCallback = () => {
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

		setNoticeState( {
			type: 'error',
			icon: 'eicon-warning',
			message: __( 'Oops, the connection failed. Try again.', 'elementor' ),
		} );

		// If not connected at onboarding load, handle the data sharing permission after the connect is handled.
		if ( ! state.isUsageDataShared && dataSharingCheckboxState ) {
			sendDataSharingRequest();
		} else {
			navigate( 'onboarding/' + nextStep );
		}
	};

	/**
	 * AJAX State Sampling and reaction.
	 */
	useEffect( () => {
		if ( 'initial' !== dataSharingAjaxState.status ) {
			if ( 'success' === dataSharingAjaxState.status && dataSharingAjaxState.response?.usageDataShared ) {
				elementorCommon.config[ 'event-tracker' ].isUserDataShared = true;

				// If connect was successful
				if ( state.isLibraryConnected ) {
					updateState( { isUsageDataShared: true } );
				} else {
					const stateToUpdate = getStateObjectToUpdate( state, 'steps', pageId, 'skipped' );

					stateToUpdate.isUsageDataShared = true;

					updateState( stateToUpdate );

					navigate( 'onboarding/' + state.nextStep );
				}
			} else if ( 'error' === dataSharingAjaxState.status ) {
				elementorCommon.events.dispatchEvent( {
					event: 'indication prompt',
					version: '',
					details: {
						placement: elementorAppConfig.onboarding.eventPlacement,
						step: state.currentStep,
						action_state: 'failure',
						action: 'connect data',
					},
				} );

				setNoticeState( {
					type: 'error',
					icon: 'eicon-warning',
					message: __( 'We couldn\'t set up data sharing. You can also do this later in the Elementor Settings page in the admin dashboard.', 'elementor' ),
				} );
			}

			// Since the data sharing Ajax request is done after the Connect sequence, moving to the next step is done
			// once the Ajax request is processed.
			navigate( 'onboarding/' + nextStep );
		}
	}, [ dataSharingAjaxState.status ] );

	return (
		<Layout pageId={ pageId } nextStep={ nextStep }>
			<PageContentLayout
				image={ elementorCommon.config.urls.assets + 'images/app/onboarding/Illustration_Account.svg' }
				title={ __( 'You\'re here! Let\'s set things up.', 'elementor' ) }
				actionButton={ actionButton }
				skipButton={ skipButton }
				noticeState={ noticeState }
			>
				{ actionButton.ref && ! state.isLibraryConnected &&
				<Connect
					buttonRef={ actionButton.ref }
					successCallback={ ( data ) => connectSuccessCallback( data ) }
					errorCallback={ connectFailureCallback }
				/> }
				<span>
					{ pageTexts.firstLine }
				</span>
				<ul>
					{ pageTexts.listItems.map( ( listItem, index ) => {
						return <li key={ 'listItem' + index }>{ listItem }</li>;
					} ) }
				</ul>
				{
					! state.isUsageDataShared &&
					<CheckBoxWithLabel
						checked={ dataSharingCheckboxState }
						onChangeCallback={ ( event ) => {
							elementorCommon.events.dispatchEvent( {
								event: 'contributor checkbox click',
								version: '',
								details: {
									placement: elementorAppConfig.onboarding.eventPlacement,
									state: event.target.checked,
								},
							} );

							setDataSharingCheckboxState( event.target.checked );
						} }
						labelText={ __( 'Become a super contributor by sharing non-sensitive data.', 'elementor' ) }
					/>
				}
			</PageContentLayout>
			{
				! state.isLibraryConnected && (
					<div className="e-onboarding__footnote">
						<p>
							{ __( 'Already have one?', 'elementor' ) + ' ' }
							<a
								ref={ alreadyHaveAccountLinkRef }
								href={ elementorAppConfig.onboarding.urls.connect + elementorAppConfig.onboarding.utms.connectCtaLink }
								onClick={ () => {
									elementorCommon.events.dispatchEvent( {
										event: 'connect account',
										version: '',
										details: {
											placement: elementorAppConfig.onboarding.eventPlacement,
											contributor: dataSharingCheckboxState,
										},
									} );
								} }
							>
								{ __( 'Connect your account', 'elementor' ) }
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

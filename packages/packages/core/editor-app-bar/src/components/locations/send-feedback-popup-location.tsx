import { ThemeProvider } from '@elementor/editor-ui';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { httpService } from '@elementor/http-client';
import { AlertCircleIcon, CheckIcon } from '@elementor/icons';
import { useMixpanel } from '@elementor/mixpanel';
import {
	bindDialog,
	Button,
	CloseButton,
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Popover,
	Stack,
	TextField,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';
import * as React from 'react';
import { useEffect, useState } from 'react';

import { EXPERIMENT_NAME, FEEDBACK_TOGGLE_EVENT } from '../../extensions/feedback/feedback-consts';
import { type ExtendedWindow } from '../../types';

const checkIfUserIsConnected = () => {
	const extendedWindow = window as unknown as ExtendedWindow;
	return (
		extendedWindow?.elementorCommon?.config.library_connect.is_connected ||
		extendedWindow?.elementorPro?.config.isActive
	);
};

type FeedbackResult = {
	success: boolean;
	message: string;
};



export default function SendFeedbackPopupLocation() {
	const isActive = isExperimentActive( EXPERIMENT_NAME );
	const extendedWindow = window as unknown as ExtendedWindow;
	const [ isUserConnected, setIsUserConnected ] = useState< boolean >( checkIfUserIsConnected() );
	const connectUrl = extendedWindow?.elementor?.config.user.top_bar.connect_url;
	const [ feedbackContent, setFeedbackContent ] = useState( '' );
	const [ feedbackResult, setFeedbackResult ] = useState< FeedbackResult | null >( null );
	const [ submitDisabled, setSubmitDisabled ] = useState( true );
	const { dispatchEvent: trackEvent = ( ...args: unknown[] ) => void args } = useMixpanel();
	const popupState = usePopupState( {
		variant: 'dialog',
		popupId: FEEDBACK_TOGGLE_EVENT,
	} );
	const [ isFetching, setIsFetching ] = useState( false );
	useEffect( () => {
		const handler = () => {
			popupState.toggle();
			// reason to re-check: clicking "connect to elementor" closes the dialog. At this time the user can perform connect, and the state might change externally.
			setIsUserConnected( checkIfUserIsConnected() );
			setFeedbackResult( null );
			trackEvent( 'feedback_modal_opened', {
				source: 'top_bar',
				context: 'v4_beta',
			} );
		};
		window.addEventListener( FEEDBACK_TOGGLE_EVENT, handler );
		return () => {
			window.removeEventListener( FEEDBACK_TOGGLE_EVENT, handler );
		};
	}, [ popupState, trackEvent ] );

	useEffect( () => {
		setSubmitDisabled( feedbackContent.trim().length < 10 || ! isUserConnected || isFetching );
	}, [ feedbackContent, feedbackResult, isUserConnected, isFetching ] );

	const handleClose = () => {
		popupState.close();
		trackEvent( 'feedback_modal_closed', {
			feedback_text: feedbackContent,
		} );
	};
	const handleStartAntoher = () => {
		setFeedbackContent( '' );
		setFeedbackResult( null );
	};
	const submitFeedback = () => {
		setIsFetching( true );
		httpService()
			.post( 'elementor/v1/feedback/submit', {
				description: feedbackContent.trim(),
			} )
			.then( ( response ) => {
				setFeedbackResult( {
					message: response.data.message,
					success: response.data.success,
				} );
				// check if unauthorized - not signed in or expired, needs to reconnect to my-elementor account
				if (
					( ! response.data.success && response.data.code.toString() === '401' ) ||
					response.data.code.toString() === '403'
				) {
					setIsUserConnected( false );
				}
				trackEvent( response.data.success ? 'feedback_submitted' : 'feedback_error', {
					feedback_length: feedbackContent.length,
					error_type: response.data.success ? undefined : 'server',
					error_message: response.data.success ? undefined : response.data.message,
				} );
			} )
			.finally( () => setIsFetching( false ) );
	};

	if ( ! isActive ) {
		return null;
	}

	return (
		<ThemeProvider>
			<Popover { ...bindDialog( popupState ) } onClose={ () => handleClose() }>
				<Dialog open={ popupState.isOpen }>
					<DialogHeader style={ { width: '100%', minWidth: '35rem' } }>
						<DialogTitle style={ { width: '100%' } }>
							<Stack
								display="flex"
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								width="100%"
							>
								{ __( 'Submit Feedback', 'elementor' ) }
								<CloseButton onClick={ popupState.close } />
							</Stack>
						</DialogTitle>
					</DialogHeader>
					<DialogContent>
						<Stack direction="column" gap={ 2 }>
							{ isUserConnected ? (
								<>
									<TextField
										autofocus
										placeholder={ __(
											'E.g. Can you add ABC features? I want to do ABC and it’s important because …',
											'elementor'
										) }
										fullwith
										label={ __( 'Your Feedback', 'elementor' ) }
										multiline
										id="elementor-feedback-usercontent"
										rows={ 6 }
										cols={ 80 }
										disabled={ isFetching || feedbackResult?.success }
										onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
											setFeedbackContent( event.target.value )
										}
										value={ feedbackContent }
									/>
									<Stack direction="row" justifyContent="flex-end" alignItems="center" gap={ 2 }>
										{ feedbackResult && (
											<>
												{ feedbackResult.success ? (
													<CheckIcon color="success" />
												) : (
													<AlertCircleIcon color="error" />
												) }
												{ feedbackResult.message }
											</>
										) }
										{ feedbackResult?.success ? (
											<Button variant="text" onClick={ () => handleStartAntoher() }>
												{ __( 'Submit Another Feedback', 'elementor' ) }
											</Button>
										) : (
											<Button
												disabled={ submitDisabled }
												onClick={ submitFeedback }
												variant="contained"
												color="primary"
												size="small"
											>
												{ __( 'Submit', 'elementor' ) }
											</Button>
										) }
									</Stack>
								</>
							) : (
								<>
									<Button
										variant="contained"
										color="primary"
										size="large"
										href={ connectUrl }
										target="_blank"
										rel="noopener"
										onClick={ popupState.close }
									>
										{ __( 'Connect to Elementor', 'elementor' ) }
									</Button>
								</>
							) }
						</Stack>
					</DialogContent>
				</Dialog>
			</Popover>
		</ThemeProvider>
	);
}

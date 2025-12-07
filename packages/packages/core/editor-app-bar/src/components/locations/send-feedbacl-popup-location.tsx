import * as React from 'react';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { httpService } from '@elementor/http-client';
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

import { FEEDBACK_TOGGLE_EVENT } from '../../extensions/feedback';
import { type ExtendedWindow } from '../../types';

export default function SendFeedbackPopupLocation() {
	const extendedWindow = window as unknown as ExtendedWindow;
	const isUserConnected =
		extendedWindow?.elementorCommon?.config.library_connect.is_connected ||
		extendedWindow?.elementorPro?.config.isActive;
	const connectUrl = extendedWindow?.elementor?.config.user.top_bar.connect_url;
	const [ feedbackContent, setFeedbackContent ] = React.useState( '' );
	const popupState = usePopupState( {
		variant: 'dialog',
		popupId: FEEDBACK_TOGGLE_EVENT,
	} );
	const [ isFetching, setIsFetching ] = useState( false );
	useEffect( () => {
		const handler = () => {
			popupState.toggle();
		};
		window.addEventListener( FEEDBACK_TOGGLE_EVENT, handler );
		return () => {
			window.removeEventListener( FEEDBACK_TOGGLE_EVENT, handler );
		};
	}, [ popupState ] );

	const submitFeedback = () => {
		setIsFetching( true );
		httpService()
			.post( 'elementor/v1/feedback/submit', {
				description: feedbackContent,
			} )
			.finally( () => setIsFetching( false ) );
	};

	if ( ! isUserConnected ) {
	}

	return (
		<ThemeProvider>
			<Popover { ...bindDialog( popupState ) } onClose={ popupState.close }>
				<Dialog open={ popupState.isOpen }>
					<DialogHeader>
						<DialogTitle>
							<Stack
								display="flex"
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								width="20rem"
							>
								Send Feedback <CloseButton onClick={ popupState.close } />
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
										disabled={ isFetching }
										onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
											setFeedbackContent( event.target.value )
										}
										value={ feedbackContent }
									/>
									<Stack direction="row" justifyContent="flex-end">
										<Button
											disabled={ isFetching }
											onClick={ submitFeedback }
											variant="contained"
											color="primary"
											size="small"
										>
											{ __( 'Submit', 'elementor' ) }
										</Button>
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
									>
										Connect to elementor
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

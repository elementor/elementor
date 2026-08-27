import * as React from 'react';
import { useState } from 'react';
import { notify } from '@elementor/editor-notifications';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { useMixpanel } from '@elementor/events';
import { httpService } from '@elementor/http-client';
import { MessageLinesIcon } from '@elementor/icons';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogHeader,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
	Tooltip,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
	FEEDBACK_CANCELLED_EVENT,
	FEEDBACK_CLICKED_EVENT,
	FEEDBACK_CLOSED_EVENT,
	FEEDBACK_ENTRY_POINT,
	FEEDBACK_EXPERIMENT_NAME,
	FEEDBACK_SENT_EVENT,
} from '../constants';

const FEEDBACK_SUBJECT = 'Page Audit Tool';
const FEEDBACK_SUBJECT_LABEL = __( 'Page Audit Tool', 'elementor' );
const SUCCESS_NOTIFICATION_ID = 'audit-feedback-success';
const ERROR_NOTIFICATION_ID = 'audit-feedback-error';
const DIALOG_TITLE_ID = 'audit-feedback-dialog-title';
const DIALOG_DESCRIPTION_ID = 'audit-feedback-dialog-description';

const isUserConnected = () =>
	Boolean( window.elementorCommon?.config?.library_connect?.is_connected || window.elementorPro?.config?.isActive );

const notifySuccess = () =>
	notify( {
		id: SUCCESS_NOTIFICATION_ID,
		type: 'success',
		message: __( 'Feedback sent. Thanks for helping us out.', 'elementor' ),
	} );

const notifyError = () =>
	notify( {
		id: ERROR_NOTIFICATION_ID,
		type: 'error',
		message: __( 'Something went wrong. Please try sending your feedback again.', 'elementor' ),
	} );

export default function AuditFeedback() {
	const [ isOpen, setIsOpen ] = useState( false );
	const [ feedbackText, setFeedbackText ] = useState( '' );
	const [ isSubmitting, setIsSubmitting ] = useState( false );
	const { dispatchEvent: trackEvent = ( ...args: unknown[] ) => void args } = useMixpanel();

	if ( ! isExperimentActive( FEEDBACK_EXPERIMENT_NAME ) ) {
		return null;
	}

	const connected = isUserConnected();
	const connectUrl = window.elementor?.config?.user?.top_bar?.connect_url;

	if ( ! connected && ! connectUrl ) {
		return null;
	}

	const triggerLabel = __( 'Give feedback', 'elementor' );

	const handleOpen = () => {
		if ( ! connected ) {
			window.open( connectUrl, '_blank', 'noopener' );
			trackEvent( FEEDBACK_CLICKED_EVENT, { entry_point: FEEDBACK_ENTRY_POINT, connected: false } );
			return;
		}

		setIsOpen( true );
		trackEvent( FEEDBACK_CLICKED_EVENT, { entry_point: FEEDBACK_ENTRY_POINT, connected: true } );
	};

	const dismiss = ( eventName: string ) => {
		setIsOpen( false );
		setFeedbackText( '' );
		trackEvent( eventName, { entry_point: FEEDBACK_ENTRY_POINT } );
	};

	const handleCancel = () => dismiss( FEEDBACK_CANCELLED_EVENT );
	const handleClose = () => dismiss( FEEDBACK_CLOSED_EVENT );

	const handleSubmit = () => {
		setIsSubmitting( true );

		httpService()
			.post( 'elementor/v1/feedback/submit', {
				subject: FEEDBACK_SUBJECT,
				description: feedbackText.trim(),
			} )
			.then( ( response ) => {
				if ( ! response.data.success ) {
					notifyError();
					return;
				}

				setIsOpen( false );
				setFeedbackText( '' );
				notifySuccess();
				trackEvent( FEEDBACK_SENT_EVENT, { entry_point: FEEDBACK_ENTRY_POINT } );
			} )
			.catch( notifyError )
			.finally( () => setIsSubmitting( false ) );
	};

	return (
		<>
			<Tooltip title={ triggerLabel } placement="top">
				<IconButton size="small" aria-label={ triggerLabel } onClick={ handleOpen }>
					<MessageLinesIcon fontSize="small" />
				</IconButton>
			</Tooltip>
			<Dialog
				open={ isOpen }
				onClose={ handleClose }
				aria-labelledby={ DIALOG_TITLE_ID }
				aria-describedby={ DIALOG_DESCRIPTION_ID }
				PaperProps={ { sx: { borderRadius: 1 } } }
			>
				<DialogHeader logo={ false } onClose={ handleClose }>
					<DialogTitle id={ DIALOG_TITLE_ID }>
						{ __( 'Let us know what you think', 'elementor' ) }
					</DialogTitle>
				</DialogHeader>
				<DialogContent dividers>
					<Stack direction="column" gap={ 2 }>
						<TextField value={ FEEDBACK_SUBJECT_LABEL } disabled fullWidth size="small" />
						<TextField
							placeholder={ __(
								'Tell us what you had in mind, what we can improve or fix to make this feature better.',
								'elementor'
							) }
							fullWidth
							multiline
							rows={ 4 }
							disabled={ isSubmitting }
							onChange={ ( event: React.ChangeEvent< HTMLInputElement > ) =>
								setFeedbackText( event.target.value )
							}
							value={ feedbackText }
						/>
						<Typography id={ DIALOG_DESCRIPTION_ID } variant="caption" color="text.secondary">
							{ __(
								"We appreciate your feedback! While we review all submissions, we can't guarantee that every suggestion will result in a change or update.",
								'elementor'
							) }
						</Typography>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button variant="text" color="secondary" onClick={ handleCancel }>
						{ __( 'Cancel', 'elementor' ) }
					</Button>
					<Button
						variant="contained"
						color="primary"
						disabled={ isSubmitting || feedbackText.trim().length === 0 }
						onClick={ handleSubmit }
					>
						{ __( 'Send', 'elementor' ) }
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

import * as React from 'react';
import { useState } from 'react';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogHeader,
	DialogTitle,
	Divider,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useUpdateUnfilteredFilesUpload } from '../hooks/use-unfiltered-files-upload';

type EnableUnfilteredModalProps = {
	open: boolean;
	onClose: ( enabled: boolean ) => void;
};

type LocalModalProps = {
	open: boolean;
	onClose: ( enabled: boolean ) => void;
	isPending?: boolean;
	isError?: boolean;
	handleEnable: () => void;
};

const ADMIN_TITLE_TEXT = __( 'Enable Unfiltered Uploads', 'elementor' );
const ADMIN_CONTENT_TEXT = __(
	'Before you enable unfiltered files upload, note that such files include a security risk. Elementor does run a process to remove possible malicious code, but there is still risk involved when using such files.',
	'elementor'
);
const NON_ADMIN_TITLE_TEXT = __( "Sorry, you can't upload that file yet", 'elementor' );
const NON_ADMIN_CONTENT_TEXT = __(
	'This is because this file type may pose a security risk. To upload them anyway, ask the site administrator to enable unfiltered file uploads.',
	'elementor'
);

const ADMIN_FAILED_CONTENT_TEXT_PT1 = __( 'Failed to enable unfiltered files upload.', 'elementor' );

const ADMIN_FAILED_CONTENT_TEXT_PT2 = __(
	'You can try again, if the problem persists, please contact support.',
	'elementor'
);

const WAIT_FOR_CLOSE_TIMEOUT_MS = 300;

export const EnableUnfilteredModal = ( props: EnableUnfilteredModalProps ) => {
	const { mutateAsync, isPending } = useUpdateUnfilteredFilesUpload();
	const { canUser } = useCurrentUserCapabilities();
	const [ isError, setIsError ] = useState( false );
	const canManageOptions = canUser( 'manage_options' );

	const onClose = ( enabled: boolean ) => {
		props.onClose( enabled );
		setTimeout( () => setIsError( false ), WAIT_FOR_CLOSE_TIMEOUT_MS );
	};

	const handleEnable = async () => {
		try {
			const response = await mutateAsync( { allowUnfilteredFilesUpload: true } );
			if ( response?.data?.success === false ) {
				setIsError( true );
			} else {
				props.onClose( true );
			}
		} catch {
			setIsError( true );
		}
	};

	const dialogProps = { ...props, isPending, handleEnable, isError, onClose };

	return canManageOptions ? <AdminDialog { ...dialogProps } /> : <NonAdminDialog { ...dialogProps } />;
};

const AdminDialog = ( { open, onClose, handleEnable, isPending, isError }: LocalModalProps ) => (
	<Dialog open={ open } maxWidth={ 'sm' } onClose={ () => onClose( false ) }>
		<DialogHeader logo={ false }>
			<DialogTitle>{ ADMIN_TITLE_TEXT }</DialogTitle>
		</DialogHeader>
		<Divider />
		<DialogContent>
			<DialogContentText>
				{ isError ? (
					<>
						{ ADMIN_FAILED_CONTENT_TEXT_PT1 } <br /> { ADMIN_FAILED_CONTENT_TEXT_PT2 }
					</>
				) : (
					ADMIN_CONTENT_TEXT
				) }
			</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button size={ 'medium' } color="secondary" onClick={ () => onClose( false ) }>
				{ __( 'Cancel', 'elementor' ) }
			</Button>
			<Button
				size={ 'medium' }
				onClick={ () => handleEnable() }
				variant="contained"
				color="primary"
				disabled={ isPending }
			>
				{ isPending ? <CircularProgress size={ 24 } /> : __( 'Enable', 'elementor' ) }
			</Button>
		</DialogActions>
	</Dialog>
);

const NonAdminDialog = ( { open, onClose }: LocalModalProps ) => (
	<Dialog open={ open } maxWidth={ 'sm' } onClose={ () => onClose( false ) }>
		<DialogHeader logo={ false }>
			<DialogTitle>{ NON_ADMIN_TITLE_TEXT }</DialogTitle>
		</DialogHeader>
		<Divider />
		<DialogContent>
			<DialogContentText>{ NON_ADMIN_CONTENT_TEXT }</DialogContentText>
		</DialogContent>
		<DialogActions>
			<Button size={ 'medium' } onClick={ () => onClose( false ) } variant="contained" color="primary">
				{ __( 'Got it', 'elementor' ) }
			</Button>
		</DialogActions>
	</Dialog>
);

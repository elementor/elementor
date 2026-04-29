import * as React from 'react';
import { notify } from '@elementor/editor-notifications';
import {
	AlertTitle,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogHeader,
	DialogTitle,
	Divider,
	Stack,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConflictOptions } from './components/conflict-options';
import { UploadDropzone } from './components/upload-dropzone';
import { UploadedFileRow } from './components/uploaded-file-row';
import { useDialogState } from './hooks/use-dialog-state';
import { useImportRequest } from './hooks/use-import-request';
import { importDialogState } from './state';

const IMPORT_STARTED_NOTIFICATION_ID = 'design-system-import-started';

type Props = {
	open: boolean;
	onClose: () => void;
};

export const ImportDesignSystemDialog = ( { open, onClose }: Props ) => {
	const { state, setFile, setConflictStrategy, reset } = useDialogState();
	const importRequest = useImportRequest();

	const isImportEnabled = Boolean( state.file && state.conflictStrategy );

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleImport = () => {
		if ( ! state.file || ! state.conflictStrategy ) {
			return;
		}

		notify( {
			id: IMPORT_STARTED_NOTIFICATION_ID,
			type: 'info',
			message: (
				<>
					<AlertTitle>{ __( 'Importing in Process', 'elementor' ) }</AlertTitle>
					{ __( 'You will be notify you when we are done importing', 'elementor' ) }
				</>
			),
		} );

		importDialogState.markImporting();

		void importRequest( { file: state.file, conflictStrategy: state.conflictStrategy } );

		handleClose();
	};

	return (
		<Dialog open={ open } onClose={ handleClose } maxWidth="sm" fullWidth>
			<DialogHeader logo={ false }>
				<DialogTitle>{ __( 'Import Design System', 'elementor' ) }</DialogTitle>
			</DialogHeader>
			<Divider />
			<DialogContent>
				<Stack spacing={ 3 }>
					{ state.file ? (
						<UploadedFileRow file={ state.file } onRemove={ () => setFile( null ) } />
					) : (
						<UploadDropzone onFileSelected={ setFile } />
					) }
					<ConflictOptions value={ state.conflictStrategy } onChange={ setConflictStrategy } />
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button size="medium" color="secondary" onClick={ handleClose }>
					{ __( 'Cancel', 'elementor' ) }
				</Button>
				<Button
					size="medium"
					variant="contained"
					color="primary"
					disabled={ ! isImportEnabled }
					onClick={ handleImport }
				>
					{ __( 'Import', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

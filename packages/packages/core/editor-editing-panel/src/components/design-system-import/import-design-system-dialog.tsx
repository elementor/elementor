import * as React from 'react';
import { notify } from '@elementor/editor-notifications';
import { FileUploadDropzone, FileUploadRow } from '@elementor/editor-ui';
import { Button, Dialog, DialogActions, DialogContent, DialogHeader, DialogTitle, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConflictOptions } from './components/conflict-options';
import { useDialogState } from './hooks/use-dialog-state';
import { useImportRequest } from './hooks/use-import-request';
import { importDialogState } from './state';

const ALLOWED_FILE_TYPES = [ 'application/zip' ];
const FILE_INPUT_ACCEPT = 'application/zip,.zip';

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
					<strong>{ __( 'Import in Progress.', 'elementor' ) }</strong>
					&nbsp;
					{ __( 'You will be notified when the import is complete.', 'elementor' ) }
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
			<DialogContent>
				<Stack spacing={ 3 }>
					{ state.file ? (
						<FileUploadRow file={ state.file } onRemove={ () => setFile( null ) } />
					) : (
						<FileUploadDropzone
							onFileSelected={ setFile }
							allowedFileTypes={ ALLOWED_FILE_TYPES }
							accept={ FILE_INPUT_ACCEPT }
							regionLabel={ __( 'Design system file dropzone', 'elementor' ) }
							helperText={ __( 'zip (max. 3MB)', 'elementor' ) }
						/>
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

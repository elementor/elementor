import * as React from 'react';
import { closeDialog, FileUploadDropzone, FileUploadRow, openDialog } from '@elementor/editor-ui';
import { Button, DialogActions, DialogContent, DialogHeader, DialogTitle, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ConflictOptions } from './components/conflict-options';
import { useDialogState } from './hooks/use-dialog-state';
import { useImportRequest } from './hooks/use-import-request';
import { notifyImportFailure, notifyImportInProgress, notifyImportSuccess } from './import-notifications';

const ALLOWED_FILE_TYPES: `${ string }/${ string }`[] = [ 'application/zip' ];
const FILE_INPUT_ACCEPT = 'application/zip,.zip';

type Props = {
	onClose: () => void;
};

const reopenSelf = () => {
	openDialog( {
		component: <ImportDesignSystemDialog onClose={ closeDialog } />,
	} );
};

export const ImportDesignSystemDialog = ( { onClose }: Props ) => {
	const { state, setFile, setConflictStrategy, reset } = useDialogState();
	const importMutation = useImportRequest();

	const isImportEnabled = Boolean( state.file && state.conflictStrategy );

	const handleClose = () => {
		reset();
		onClose();
	};

	const handleImport = () => {
		if ( ! state.file || ! state.conflictStrategy ) {
			return;
		}

		notifyImportInProgress();

		importMutation
			.mutateAsync( { file: state.file, conflictStrategy: state.conflictStrategy } )
			.then( notifyImportSuccess )
			.catch( () => notifyImportFailure( reopenSelf ) );

		handleClose();
	};

	return (
		<>
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
		</>
	);
};

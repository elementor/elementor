import * as React from 'react';
import { closeDialog, FileUploadDropzone, FileUploadRow, openDialog } from '@elementor/editor-ui';
import { Button, DialogActions, DialogContent, DialogHeader, DialogTitle, Stack } from '@elementor/ui';
import { __, sprintf } from '@wordpress/i18n';

import { ConflictOptions } from './components/conflict-options';
import { useDialogState } from './hooks/use-dialog-state';
import { DesignSystemUploadValidationError, useImportRequest } from './hooks/use-import-request';
import { notifyImportFailure, notifyImportInProgress, notifyImportSuccess } from './import-notifications';
import { designSystemFileType, trackDesignSystem } from './tracking';
import { type ConflictStrategy } from './types';

const ALLOWED_FILE_TYPES: `${ string }/${ string }`[] = [ 'application/zip' ];
const FILE_INPUT_ACCEPT = 'application/zip,.zip';
// TODO: Replace with the actual server-enforced limit once finalized.
const MAX_FILE_SIZE_MB = 3;

type Props = {
	onClose: () => void;
};

const reopenSelf = () => {
	trackDesignSystem( { event: 'importOpened' } );
	openDialog( {
		component: <ImportDesignSystemDialog onClose={ closeDialog } />,
	} );
};

export const ImportDesignSystemDialog = ( { onClose }: Props ) => {
	const { file, conflictStrategy, setFile, setConflictStrategy } = useDialogState();
	const importMutation = useImportRequest();

	const isImportEnabled = Boolean( file && conflictStrategy );

	const handleFileSelected = ( selected: File ) => {
		setFile( selected );
		trackDesignSystem( { event: 'fileSelected', file_type: designSystemFileType } );
	};

	const handleConflictChange = ( choice: ConflictStrategy ) => {
		setConflictStrategy( choice );
		trackDesignSystem( { event: 'conflictChoice', choice } );
	};

	const handleImport = async () => {
		if ( ! file || ! conflictStrategy ) {
			return;
		}

		trackDesignSystem( { event: 'confirmed', conflict_choice: conflictStrategy } );
		notifyImportInProgress();
		onClose();

		try {
			await importMutation.mutateAsync( { file, conflictStrategy } );
			trackDesignSystem( { event: 'imported' } );
			notifyImportSuccess();
		} catch ( error ) {
			if ( error instanceof DesignSystemUploadValidationError ) {
				trackDesignSystem( { event: 'validationFailed', file_type: designSystemFileType } );
			} else {
				trackDesignSystem( { event: 'importFailed' } );
			}
			notifyImportFailure( reopenSelf );
		}
	};

	return (
		<>
			<DialogHeader logo={ false }>
				<DialogTitle>{ __( 'Import Design System', 'elementor' ) }</DialogTitle>
			</DialogHeader>
			<DialogContent>
				<Stack spacing={ 3 }>
					{ file ? (
						<FileUploadRow file={ file } onRemove={ () => setFile( null ) } />
					) : (
						<FileUploadDropzone
							onFileSelected={ handleFileSelected }
							allowedFileTypes={ ALLOWED_FILE_TYPES }
							accept={ FILE_INPUT_ACCEPT }
							regionLabel={ __( 'Design system file dropzone', 'elementor' ) }
							helperText={ sprintf(
								// translators: %d is the maximum file size in megabytes.
								__( 'zip (max. %dMB)', 'elementor' ),
								MAX_FILE_SIZE_MB
							) }
						/>
					) }
					<ConflictOptions value={ conflictStrategy } onChange={ handleConflictChange } />
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button size="medium" color="secondary" onClick={ onClose }>
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

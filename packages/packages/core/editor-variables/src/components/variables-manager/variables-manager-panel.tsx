import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
	__createPanel as createPanel,
	Panel,
	PanelBody,
	PanelFooter,
	PanelHeader,
	PanelHeaderTitle,
} from '@elementor/editor-panels';
import { SaveChangesDialog, ThemeProvider, useDialog } from '@elementor/editor-ui';
import { changeEditMode } from '@elementor/editor-v1-adapters';
import { ColorFilterIcon, TrashIcon, XIcon, FilesIcon } from '@elementor/icons';
import { Alert, Box, Button, Collapse, Divider, ErrorBoundary, IconButton, type IconButtonProps, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { getVariables } from '../../hooks/use-prop-variables';
import { service } from '../../service';
import { type TVariablesList } from '../../storage';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { VariablesManagerTable } from './variables-manager-table';
import { VariablesImportPanel } from './variables-import-panel';

const id = 'variables-manager';

export const { panel, usePanelActions } = createPanel( {
	id,
	component: VariablesManagerPanel,
	allowedEditModes: [ 'edit', id ],
	onOpen: () => {
		changeEditMode( id );
	},
	onClose: () => {
		changeEditMode( 'edit' );
	},
} );

export function VariablesManagerPanel() {
	const { close: closePanel } = usePanelActions();

	const [ variables, setVariables ] = useState( getVariables( false ) );
	const [ deletedVariables, setDeletedVariables ] = useState< string[] >( [] );
	const [ deleteConfirmation, setDeleteConfirmation ] = useState< { id: string; label: string } | null >( null );

	const [ isDirty, setIsDirty ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();

	// Import UI state
	const [ showImportUI, setShowImportUI ] = React.useState( false );

	usePreventUnload( isDirty );

	const handleClosePanel = () => {
		if ( isDirty ) {
			openSaveChangesDialog();
			return;
		}

		closePanel();
	};

	const handleSave = useCallback( async () => {
		setIsSaving( true );

		const originalVariables = getVariables( false );
		const result = await service.batchSave( originalVariables, variables );

		if ( result.success ) {
			await service.load();
			const updatedVariables = service.variables();

			setVariables( updatedVariables );
			setIsDirty( false );
			setDeletedVariables( [] );
		}

		setIsSaving( false );
	}, [ variables ] );

	const menuActions = [
		{
			name: __( 'Delete', 'elementor' ),
			icon: TrashIcon,
			color: 'error.main',
			onClick: ( itemId: string ) => {
				if ( variables[ itemId ] ) {
					setDeleteConfirmation( { id: itemId, label: variables[ itemId ].label } );
				}
			},
		},
	];

	const handleDeleteVariable = ( itemId: string ) => {
		setDeletedVariables( [ ...deletedVariables, itemId ] );
		setVariables( { ...variables, [ itemId ]: { ...variables[ itemId ], deleted: true } } );
		setIsDirty( true );
		setDeleteConfirmation( null );
	};

	const handleOnChange = ( newVariables: TVariablesList ) => {
		setVariables( newVariables );
		setIsDirty( true );
	};

	return (
		<ThemeProvider>
			<ErrorBoundary fallback={ <ErrorBoundaryFallback /> }>
				<Panel>
					<PanelHeader>
						<Stack width="100%" direction="column" alignItems="center">
							<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center">
								<Stack width="100%" direction="row" gap={ 1 }>
									<PanelHeaderTitle sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
										<ColorFilterIcon fontSize="inherit" />
										{ __( 'Variable Manager', 'elementor' ) }
									</PanelHeaderTitle>
								</Stack>
								<IconButton
									size="small"
									color="secondary"
									aria-label="Import variables"
									onClick={ () => setShowImportUI( ( prev ) => ! prev ) }
									sx={ { marginLeft: 'auto' } }
								>
									<FilesIcon fontSize="small" />
								</IconButton>
								<CloseButton
									sx={ { marginLeft: 'auto' } }
									onClose={ () => {
										handleClosePanel();
									} }
								/>
							</Stack>
							<Divider sx={ { width: '100%' } } />
						</Stack>
					</PanelHeader>
					<PanelBody
						sx={ {
							display: 'flex',
							flexDirection: 'column',
							height: '100%',
						} }
					>
						<Collapse in={ showImportUI } timeout="auto" unmountOnExit>
							<VariablesImportPanel onImported={ () => {
								// No-op: storage.load() already triggers in service.load(); re-render occurs when panel props/state change
							} } />
						</Collapse>
						{ ! showImportUI && (
							<>
								<Divider />
								<VariablesManagerTable
									menuActions={ menuActions }
									variables={ variables }
									onChange={ handleOnChange }
								/>
							</>
						) }
					</PanelBody>

					<PanelFooter>
						<Button
							fullWidth
							size="small"
							color="global"
							variant="contained"
							disabled={ ! isDirty || isSaving }
							onClick={ handleSave }
						>
							{ __( 'Save changes', 'elementor' ) }
						</Button>
					</PanelFooter>
				</Panel>

				{ deleteConfirmation && (
					<DeleteConfirmationDialog
						open
						label={ deleteConfirmation.label }
						onConfirm={ () => handleDeleteVariable( deleteConfirmation.id ) }
						closeDialog={ () => setDeleteConfirmation( null ) }
					/>
				) }
			</ErrorBoundary>
			{ isSaveChangesDialogOpen && (
				<SaveChangesDialog>
					<SaveChangesDialog.Title onClose={ closeSaveChangesDialog }>
						{ __( 'You have unsaved changes', 'elementor' ) }
					</SaveChangesDialog.Title>
					<SaveChangesDialog.Content>
						<SaveChangesDialog.ContentText>
							{ __( 'To avoid losing your updates, save your changes before leaving.', 'elementor' ) }
						</SaveChangesDialog.ContentText>
					</SaveChangesDialog.Content>
					<SaveChangesDialog.Actions
						actions={ {
							discard: {
								label: __( 'Discard', 'elementor' ),
								action: () => {
									closeSaveChangesDialog();
									closePanel();
								},
							},
							confirm: {
								label: __( 'Save', 'elementor' ),
								action: async () => {
									await handleSave();
									closeSaveChangesDialog();
									closePanel();
								},
							},
						} }
					/>
				</SaveChangesDialog>
			) }
		</ThemeProvider>
	);
}

const CloseButton = ( { onClose, ...props }: IconButtonProps & { onClose: () => void } ) => (
	<IconButton size="small" color="secondary" onClick={ onClose } aria-label="Close" { ...props }>
		<XIcon fontSize="small" />
	</IconButton>
);

const ErrorBoundaryFallback = () => (
	<Box role="alert" sx={ { minHeight: '100%', p: 2 } }>
		<Alert severity="error" sx={ { mb: 2, maxWidth: 400, textAlign: 'center' } }>
			<strong>{ __( 'Something went wrong', 'elementor' ) }</strong>
		</Alert>
	</Box>
);

const usePreventUnload = ( isDirty: boolean ) => {
	useEffect( () => {
		const handleBeforeUnload = ( event: BeforeUnloadEvent ) => {
			if ( isDirty ) {
				event.preventDefault();
			}
		};

		window.addEventListener( 'beforeunload', handleBeforeUnload );

		return () => {
			window.removeEventListener( 'beforeunload', handleBeforeUnload );
		};
	}, [ isDirty ] );
};

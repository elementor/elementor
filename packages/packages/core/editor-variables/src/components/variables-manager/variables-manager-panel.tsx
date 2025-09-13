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
import { ColorFilterIcon, TrashIcon } from '@elementor/icons';
import { Alert, Box, Button, CloseButton, Divider, ErrorBoundary, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { generateTempId } from '../../batch-operations';
import { getVariables } from '../../hooks/use-prop-variables';
import { service } from '../../service';
import { type TVariablesList } from '../../storage';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { SIZE, VariableManagerCreateMenu } from './variables-manager-create-menu';
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
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();

	const [ variables, setVariables ] = useState( getVariables( false ) );
	const [ deletedVariables, setDeletedVariables ] = useState< string[] >( [] );
	const [ ids, setIds ] = useState< string[] >( Object.keys( variables ) );

	// Import UI state
	const [ showImportUI, setShowImportUI ] = React.useState( false );

	const [ deleteConfirmation, setDeleteConfirmation ] = useState< { id: string; label: string } | null >( null );
	const [ autoEditVariableId, setAutoEditVariableId ] = useState< string | undefined >( undefined );
	const [ isDirty, setIsDirty ] = useState( false );

	usePreventUnload( isDirty );

	const handleClosePanel = () => {
		if ( isDirty ) {
			openSaveChangesDialog();
			return;
		}

		closePanel();
	};

	const handleSave = useCallback( async () => {
		const originalVariables = getVariables( false );
		const result = await service.batchSave( originalVariables, variables );

		setIsDirty( false );

		if ( result.success ) {
			await service.load();
			const updatedVariables = service.variables();

			setVariables( updatedVariables );
			setIds( Object.keys( updatedVariables ) );
			setDeletedVariables( [] );
		} else {
			setIsDirty( true );
		}
	}, [ variables ] );

	const handleOnChange = ( newVariables: TVariablesList ) => {
		setVariables( newVariables );
		setIsDirty( true );
	};

	const createVariable = useCallback( ( type: string, defaultName: string, defaultValue: string ) => {
		const newId = generateTempId();
		const newVariable = {
			id: newId,
			label: defaultName,
			value: defaultValue,
			type,
		};

		setVariables( ( prev ) => ( { ...prev, [ newId ]: newVariable } ) );
		setIds( ( prev ) => [ ...prev, newId ] );
		setIsDirty( true );

		setAutoEditVariableId( newId );
	}, [] );

	const handleDeleteVariable = ( itemId: string ) => {
		setDeletedVariables( [ ...deletedVariables, itemId ] );
		setVariables( { ...variables, [ itemId ]: { ...variables[ itemId ], deleted: true } } );
		setIsDirty( true );
		setDeleteConfirmation( null );
	};

	const handleAutoEditComplete = useCallback( () => {
		setTimeout( () => {
			setAutoEditVariableId( undefined );
		}, 100 );
	}, [] );

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
										closePanel();
									} }
								/>
								<Stack direction="row" gap={ 0.5 } alignItems="center">
									<VariableManagerCreateMenu onCreate={ createVariable } variables={ variables } />
									<CloseButton
										aria-label="Close"
										slotProps={ { icon: { fontSize: SIZE } } }
										onClick={ () => {
											handleClosePanel();
										} }
									/>
								</Stack>
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
						<VariablesManagerTable
							menuActions={ menuActions }
							variables={ variables }
							onChange={ handleOnChange }
							ids={ ids }
							onIdsChange={ setIds }
							autoEditVariableId={ autoEditVariableId }
							onAutoEditComplete={ handleAutoEditComplete }
						/>
					</PanelBody>

					<PanelFooter>
						<Button
							fullWidth
							size="small"
							color="global"
							variant="contained"
							disabled={ ! isDirty }
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

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
import { SaveChangesDialog, SearchField, ThemeProvider, useDialog } from '@elementor/editor-ui';
import { changeEditMode } from '@elementor/editor-v1-adapters';
import { ColorFilterIcon, FilesIcon, TrashIcon } from '@elementor/icons';
import { Alert, Box, Button, CloseButton, Collapse, Divider, ErrorBoundary, IconButton, Stack, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { EmptyState } from '../ui/empty-state';
import { NoSearchResults } from '../ui/no-search-results';
import { useAutoEdit } from './hooks/use-auto-edit';
import { useVariablesManagerState } from './hooks/use-variables-manager-state';
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

	const createMenuState = usePopupState( {
		variant: 'popover',
	} );

	const {
		variables,
		isDirty,
		hasValidationErrors,
		searchValue,
		handleOnChange,
		createVariable,
		handleDeleteVariable,
		handleSave,
		isSaving,
		handleSearch,
		setHasValidationErrors,
	} = useVariablesManagerState();

	// Import UI state
	const [ showImportUI, setShowImportUI ] = React.useState( false );

	const { autoEditVariableId, startAutoEdit, handleAutoEditComplete } = useAutoEdit();

	const [ deleteConfirmation, setDeleteConfirmation ] = useState< { id: string; label: string } | null >( null );

	usePreventUnload( isDirty );

	const handleClosePanel = () => {
		if ( isDirty ) {
			openSaveChangesDialog();
			return;
		}

		closePanel();
	};

	const handleCreateVariable = useCallback(
		( type: string, defaultName: string, defaultValue: string ) => {
			const newId = createVariable( type, defaultName, defaultValue );
			if ( newId ) {
				startAutoEdit( newId );
			}
		},
		[ createVariable, startAutoEdit ]
	);

	const handleDeleteVariableWithConfirmation = useCallback(
		( itemId: string ) => {
			handleDeleteVariable( itemId );
			setDeleteConfirmation( null );
		},
		[ handleDeleteVariable ]
	);

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

	const hasVariables = Object.values( variables ).some( ( variable ) => ! variable.deleted );

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
									<VariableManagerCreateMenu
										onCreate={ handleCreateVariable }
										variables={ variables }
										menuState={ createMenuState }
									/>
									<CloseButton
										aria-label="Close"
										slotProps={ { icon: { fontSize: SIZE } } }
										onClick={ () => {
											handleClosePanel();
										} }
									/>
								</Stack>
							</Stack>
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
								{ hasVariables && (
									<VariablesManagerTable
										menuActions={ menuActions }
										variables={ variables }
										onChange={ handleOnChange }
										autoEditVariableId={ autoEditVariableId }
										onAutoEditComplete={ handleAutoEditComplete }
										onFieldError={ setHasValidationErrors }
									/>
								) }

								{ ! hasVariables && searchValue && (
									<NoSearchResults
										searchValue={ searchValue }
										onClear={ () => handleSearch( '' ) }
										icon={ <ColorFilterIcon fontSize="large" /> }
									/>
								) }

								{ ! hasVariables && ! searchValue && (
									<EmptyState
										title={ __( 'Create your first variable', 'elementor' ) }
										message={ __(
											'Variables are saved attributes that you can apply anywhere on your site.',
											'elementor'
										) }
										icon={ <ColorFilterIcon fontSize="large" /> }
										onAdd={ createMenuState.open }
									/>
								) }
							</>
						) }
					</PanelBody>

					<PanelFooter>
						<Button
							fullWidth
							size="small"
							color="global"
							variant="contained"
							disabled={ ! isDirty || hasValidationErrors || isSaving }
							onClick={ handleSave }
							loading={ isSaving }
						>
							{ __( 'Save changes', 'elementor' ) }
						</Button>
					</PanelFooter>
				</Panel>

				{ deleteConfirmation && (
					<DeleteConfirmationDialog
						open
						label={ deleteConfirmation.label }
						onConfirm={ () => handleDeleteVariableWithConfirmation( deleteConfirmation.id ) }
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

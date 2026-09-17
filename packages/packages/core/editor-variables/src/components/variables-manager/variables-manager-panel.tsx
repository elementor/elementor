import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { PanelBody, PanelFooter } from '@elementor/editor-panels';
import { ConfirmationDialog, SaveChangesDialog, SearchField, useDialog } from '@elementor/editor-ui';
import { AlertTriangleFilledIcon, ColorFilterIcon, CopyIcon, TrashIcon } from '@elementor/icons';
import { Alert, AlertAction, AlertTitle, Box, Button, Divider, Infotip, Stack, usePopupState } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { trackVariablesManagerEvent, trackVariableSyncToV3 } from '../../utils/tracking';
import { type ErrorResponse, type MappedError, mapServerError } from '../../utils/validations';
import { getMenuActionsForVariable, getVariableType } from '../../variables-registry/variable-type-registry';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { EmptyState } from '../ui/empty-state';
import { NoSearchResults } from '../ui/no-search-results';
import { useAutoEdit } from './hooks/use-auto-edit';
import { useErrorNavigation } from './hooks/use-error-navigation';
import { useVariablesManagerState } from './hooks/use-variables-manager-state';
import { VariableManagerCreateMenu } from './variables-manager-create-menu';
import { VariablesManagerTable } from './variables-manager-table';

const STOP_SYNC_MESSAGE_KEY = 'stop-sync-variable';

type StopSyncConfirmationDialogProps = {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
};

export type VariablesManagerPanelEmbeddedProps = {
	onRequestClose: () => void | Promise< void >;
	onExposeCloseAttempt?: ( attemptClose: ( () => void ) | null ) => void;
};

export function VariablesManagerPanelEmbedded( {
	onRequestClose,
	onExposeCloseAttempt,
}: VariablesManagerPanelEmbeddedProps ) {
	return (
		<VariablesManagerPanelContent onRequestClose={ onRequestClose } onExposeCloseAttempt={ onExposeCloseAttempt } />
	);
}

type VariablesManagerPanelContentProps = {
	onRequestClose: () => void | Promise< void >;
	onExposeCloseAttempt?: ( attemptClose: ( () => void ) | null ) => void;
};

function VariablesManagerPanelContent( { onRequestClose, onExposeCloseAttempt }: VariablesManagerPanelContentProps ) {
	const { open: openSaveChangesDialog, close: closeSaveChangesDialog, isOpen: isSaveChangesDialogOpen } = useDialog();
	const [ isStopSyncSuppressed ] = useSuppressedMessage( STOP_SYNC_MESSAGE_KEY );

	const createMenuState = usePopupState( {
		variant: 'popover',
	} );

	const {
		variables,
		isDirty,
		searchValue,
		isSaveDisabled,
		handleOnChange,
		createVariable,
		duplicateVariable,
		handleDeleteVariable,
		handleStartSync: startSyncFromState,
		handleStopSync: stopSyncFromState,
		handleSave,
		isSaving,
		handleSearch,
		setIsSaving,
		setIsSaveDisabled,
	} = useVariablesManagerState();

	const { autoEditVariableId, startAutoEdit, handleAutoEditComplete } = useAutoEdit();
	const { createNavigationCallback, resetNavigation } = useErrorNavigation();

	const [ deleteConfirmation, setDeleteConfirmation ] = useState< { id: string; label: string } | null >( null );
	const [ stopSyncConfirmation, setStopSyncConfirmation ] = useState< string | null >( null );
	const [ serverError, setServerError ] = useState< MappedError | null >( null );

	usePreventUnload( isDirty );

	const handleClosePanel = useCallback( () => {
		if ( isDirty ) {
			openSaveChangesDialog();
			return;
		}

		void onRequestClose();
	}, [ isDirty, openSaveChangesDialog, onRequestClose ] );

	useEffect( () => {
		if ( ! onExposeCloseAttempt ) {
			return;
		}

		onExposeCloseAttempt( () => handleClosePanel() );

		return () => onExposeCloseAttempt( null );
	}, [ onExposeCloseAttempt, handleClosePanel ] );

	const handleCreateVariable = useCallback(
		( type: string, defaultName: string, defaultValue: string ) => {
			const newId = createVariable( type, defaultName, defaultValue );
			if ( newId ) {
				startAutoEdit( newId );
			}
		},
		[ createVariable, startAutoEdit ]
	);

	const handleSaveClick = async () => {
		try {
			setServerError( null );
			resetNavigation();

			const result = await handleSave();
			trackVariablesManagerEvent( { action: 'saveChanges' } );
			return result;
		} catch ( error ) {
			const mappedError = mapServerError( error as ErrorResponse );
			const duplicatedIds = mappedError?.action?.data?.duplicatedIds;

			if ( mappedError && 'label' === mappedError.field ) {
				if ( duplicatedIds && mappedError.action ) {
					mappedError.action.callback = createNavigationCallback( duplicatedIds, startAutoEdit, () => {
						setIsSaveDisabled( false );
					} );
				}

				setServerError( mappedError );
				setIsSaveDisabled( true );
				resetNavigation();
			}

			return { success: false, error: mappedError };
		} finally {
			setIsSaving( false );
		}
	};

	const handleDeleteVariableWithConfirmation = useCallback(
		( itemId: string ) => {
			handleDeleteVariable( itemId );
			setDeleteConfirmation( null );
		},
		[ handleDeleteVariable ]
	);

	const commitStopSync = useCallback(
		( itemId: string ) => {
			stopSyncFromState( itemId );
			const variable = variables[ itemId ];
			if ( variable ) {
				trackVariableSyncToV3( { variableLabel: variable.label, action: 'unsync' } );
			}
		},
		[ stopSyncFromState, variables ]
	);

	const handleStartSync = useCallback(
		( itemId: string ) => {
			startSyncFromState( itemId );
			const variable = variables[ itemId ];
			if ( variable ) {
				trackVariableSyncToV3( { variableLabel: variable.label, action: 'sync' } );
			}
		},
		[ startSyncFromState, variables ]
	);

	const handleStopSync = useCallback(
		( itemId: string ) => {
			if ( ! isStopSyncSuppressed ) {
				setStopSyncConfirmation( itemId );
			} else {
				commitStopSync( itemId );
			}
		},
		[ isStopSyncSuppressed, commitStopSync ]
	);

	const buildMenuActions = useCallback(
		( variableId: string ) => {
			const variable = variables[ variableId ];
			if ( ! variable ) {
				return [];
			}

			const typeActions = getMenuActionsForVariable( variable.type, {
				variable,
				variableId,
				handlers: {
					onStartSync: handleStartSync,
					onStopSync: handleStopSync,
				},
			} );

			const duplicateAction = {
				name: __( 'Duplicate', 'elementor' ),
				icon: CopyIcon,
				color: 'text.primary',
				onClick: ( itemId: string ) => {
					const newId = duplicateVariable( itemId );
					startAutoEdit( newId );

					const variableTypeOptions = getVariableType( variable.type );
					trackVariablesManagerEvent( {
						action: 'duplicate',
						varType: variableTypeOptions?.variableType,
					} );
				},
			};

			const deleteAction = {
				name: __( 'Delete', 'elementor' ),
				icon: TrashIcon,
				color: 'error.main',
				onClick: ( itemId: string ) => {
					const v = variables[ itemId ];
					if ( v ) {
						setDeleteConfirmation( { id: itemId, label: v.label } );

						const variableTypeOptions = getVariableType( v.type );
						trackVariablesManagerEvent( { action: 'delete', varType: variableTypeOptions?.variableType } );
					}
				},
			};

			return [ ...typeActions, duplicateAction, deleteAction ];
		},
		[ variables, handleStartSync, handleStopSync, duplicateVariable, startAutoEdit ]
	);

	const hasVariables = Object.keys( variables ).length > 0;

	return (
		<>
			<Stack
				direction="column"
				sx={ {
					height: '100%',
					width: '100%',
					flex: 1,
					minHeight: 0,
					overflow: 'hidden',
				} }
			>
				<Stack
					direction="row"
					alignItems="center"
					spacing={ 1 }
					width="100%"
					sx={ {
						flexShrink: 0,
						px: 2,
						pb: 1,
					} }
				>
					<SearchField
						placeholder={ __( 'Search', 'elementor' ) }
						value={ searchValue }
						onSearch={ handleSearch }
						sx={ {
							flex: 1,
							minWidth: 0,
							px: 0,
							py: 0,
							display: 'flex',
							alignItems: 'center',
							alignSelf: 'stretch',
						} }
					/>
					<Box sx={ { display: 'flex', flexShrink: 0, alignItems: 'center' } }>
						<VariableManagerCreateMenu
							outlinedTrigger
							onCreate={ handleCreateVariable }
							variables={ variables }
							menuState={ createMenuState }
						/>
					</Box>
				</Stack>
				<Divider sx={ { width: '100%' } } />
				<PanelBody
					sx={ {
						display: 'flex',
						flexDirection: 'column',
						flex: 1,
						minHeight: 0,
					} }
				>
					{ hasVariables && (
						<VariablesManagerTable
							menuActions={ buildMenuActions }
							variables={ variables }
							onChange={ handleOnChange }
							autoEditVariableId={ autoEditVariableId }
							onAutoEditComplete={ handleAutoEditComplete }
							onFieldError={ setIsSaveDisabled }
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
				</PanelBody>
				<PanelFooter>
					<Infotip
						placement="right"
						open={ !! serverError }
						content={
							serverError ? (
								<Alert
									severity={ serverError.severity ?? 'error' }
									action={
										serverError.action?.label ? (
											<AlertAction onClick={ serverError.action.callback }>
												{ serverError.action.label }
											</AlertAction>
										) : undefined
									}
									onClose={
										! serverError.action?.label
											? () => {
													setServerError( null );
													setIsSaveDisabled( false );
											  }
											: undefined
									}
									icon={
										serverError.IconComponent ? (
											<serverError.IconComponent />
										) : (
											<AlertTriangleFilledIcon />
										)
									}
								>
									<AlertTitle>{ serverError.message }</AlertTitle>
									{ serverError.action?.message }
								</Alert>
							) : null
						}
						arrow={ false }
						slotProps={ {
							popper: {
								modifiers: [
									{
										name: 'offset',
										options: { offset: [ -10, 10 ] },
									},
								],
							},
						} }
					>
						<Button
							fullWidth
							size="small"
							color="global"
							variant="contained"
							disabled={ isSaveDisabled || ! isDirty || isSaving }
							onClick={ handleSaveClick }
							loading={ isSaving }
						>
							{ __( 'Save changes', 'elementor' ) }
						</Button>
					</Infotip>
				</PanelFooter>
			</Stack>
			{ deleteConfirmation && (
				<DeleteConfirmationDialog
					open
					label={ deleteConfirmation.label }
					onConfirm={ () => handleDeleteVariableWithConfirmation( deleteConfirmation.id ) }
					closeDialog={ () => setDeleteConfirmation( null ) }
				/>
			) }

			{ stopSyncConfirmation && (
				<StopSyncConfirmationDialog
					open
					onClose={ () => setStopSyncConfirmation( null ) }
					onConfirm={ () => {
						commitStopSync( stopSyncConfirmation );
						setStopSyncConfirmation( null );
					} }
				/>
			) }

			{ isSaveChangesDialogOpen && (
				<SaveChangesDialog>
					<SaveChangesDialog.Title onClose={ closeSaveChangesDialog }>
						{ __( 'You have unsaved changes', 'elementor' ) }
					</SaveChangesDialog.Title>
					<SaveChangesDialog.Content>
						<SaveChangesDialog.ContentText>
							{ __( 'You have unsaved changes in the Variables Manager.', 'elementor' ) }
						</SaveChangesDialog.ContentText>
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
									void onRequestClose();
								},
							},
							confirm: {
								label: __( 'Save', 'elementor' ),
								action: async () => {
									const result = await handleSaveClick();
									closeSaveChangesDialog();
									if ( result?.success ) {
										void onRequestClose();
									}
								},
							},
						} }
					/>
				</SaveChangesDialog>
			) }
		</>
	);
}

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

const StopSyncConfirmationDialog = ( { open, onClose, onConfirm }: StopSyncConfirmationDialogProps ) => {
	const [ , suppressStopSyncMessage ] = useSuppressedMessage( STOP_SYNC_MESSAGE_KEY );

	return (
		<ConfirmationDialog open={ open } onClose={ onClose }>
			<ConfirmationDialog.Title icon={ ColorFilterIcon } iconColor="primary">
				{ __( 'Stop syncing variable color', 'elementor' ) }
			</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __(
						'This will disconnect the variable color from Global Colors. Existing uses on your site will automatically switch to a default color.',
						'elementor'
					) }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<ConfirmationDialog.Actions
				onClose={ onClose }
				onConfirm={ onConfirm }
				cancelLabel={ __( 'Cancel', 'elementor' ) }
				confirmLabel={ __( 'Got it', 'elementor' ) }
				color="primary"
				onSuppressMessage={ suppressStopSyncMessage }
				suppressLabel={ __( "Don't show again", 'elementor' ) }
			/>
		</ConfirmationDialog>
	);
};

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
import { AlertTriangleFilledIcon, ColorFilterIcon, TrashIcon } from '@elementor/icons';
import {
	Alert,
	AlertAction,
	AlertTitle,
	Button,
	CloseButton,
	Divider,
	Infotip,
	Stack,
	usePopupState,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { trackVariablesManagerEvent } from '../../utils/tracking';
import { type ErrorResponse, type MappedError, mapServerError } from '../../utils/validations';
import { getVariableType } from '../../variables-registry/variable-type-registry';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
import { EmptyState } from '../ui/empty-state';
import { NoSearchResults } from '../ui/no-search-results';
import { useAutoEdit } from './hooks/use-auto-edit';
import { useErrorNavigation } from './hooks/use-error-navigation';
import { useVariablesManagerState } from './hooks/use-variables-manager-state';
import { SIZE, VariableManagerCreateMenu } from './variables-manager-create-menu';
import { VariablesManagerTable } from './variables-manager-table';

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
	isOpenPreviousElement: true,
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
		searchValue,
		isSaveDisabled,
		handleOnChange,
		createVariable,
		handleDeleteVariable,
		handleSave,
		isSaving,
		handleSearch,
		setIsSaving,
		setIsSaveDisabled,
	} = useVariablesManagerState();

	const { autoEditVariableId, startAutoEdit, handleAutoEditComplete } = useAutoEdit();
	const { createNavigationCallback, resetNavigation } = useErrorNavigation();

	const [ deleteConfirmation, setDeleteConfirmation ] = useState< { id: string; label: string } | null >( null );
	const [ serverError, setServerError ] = useState< MappedError | null >( null );

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

	const menuActions = [
		{
			name: __( 'Delete', 'elementor' ),
			icon: TrashIcon,
			color: 'error.main',
			onClick: ( itemId: string ) => {
				const variable = variables[ itemId ];
				if ( variable ) {
					setDeleteConfirmation( { id: itemId, label: variable.label } );

					const variableTypeOptions = getVariableType( variable.type );
					trackVariablesManagerEvent( { action: 'delete', varType: variableTypeOptions?.variableType } );
				}
			},
		},
	];

	const hasVariables = Object.keys( variables ).length > 0;

	return (
		<ThemeProvider>
			<Panel>
				<PanelHeader
					sx={ {
						height: 'unset',
					} }
				>
					<Stack width="100%" direction="column" alignItems="center">
						<Stack p={ 1 } pl={ 2 } width="100%" direction="row" alignItems="center">
							<Stack width="100%" direction="row" gap={ 1 }>
								<PanelHeaderTitle sx={ { display: 'flex', alignItems: 'center', gap: 0.5 } }>
									<ColorFilterIcon fontSize="inherit" />
									{ __( 'Variables Manager', 'elementor' ) }
								</PanelHeaderTitle>
							</Stack>
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
						<Stack width="100%" direction="row" gap={ 1 }>
							<SearchField
								sx={ {
									display: 'flex',
									flex: 1,
								} }
								placeholder={ __( 'Search', 'elementor' ) }
								value={ searchValue }
								onSearch={ handleSearch }
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
					{ hasVariables && (
						<VariablesManagerTable
							menuActions={ menuActions }
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
			</Panel>

			{ deleteConfirmation && (
				<DeleteConfirmationDialog
					open
					label={ deleteConfirmation.label }
					onConfirm={ () => handleDeleteVariableWithConfirmation( deleteConfirmation.id ) }
					closeDialog={ () => setDeleteConfirmation( null ) }
				/>
			) }

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
									const result = await handleSaveClick();
									closeSaveChangesDialog();
									if ( result?.success ) {
										closePanel();
									}
								},
							},
						} }
					/>
				</SaveChangesDialog>
			) }
		</ThemeProvider>
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

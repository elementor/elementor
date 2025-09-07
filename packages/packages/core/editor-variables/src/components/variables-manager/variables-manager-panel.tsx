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
import { ThemeProvider } from '@elementor/editor-ui';
import { changeEditMode } from '@elementor/editor-v1-adapters';
import { ColorFilterIcon, TrashIcon } from '@elementor/icons';
import { Alert, Box, Button, CloseButton, Divider, ErrorBoundary, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { generateTempId } from '../../batch-operations';
import { getVariables } from '../../hooks/use-prop-variables';
import { service } from '../../service';
import { type TVariablesList } from '../../storage';
import { SIZE, VariableManagerPlusMenu } from './variables-manager-create-menu';
import { DeleteConfirmationDialog } from '../ui/delete-confirmation-dialog';
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
} );

export function VariablesManagerPanel() {
	const { close: closePanel } = usePanelActions();

	const [ variables, setVariables ] = useState( getVariables( false ) );
	const [ deletedVariables, setDeletedVariables ] = useState< string[] >( [] );
	const [ deleteConfirmation, setDeleteConfirmation ] = useState< { id: string; label: string } | null >( null );
	const [ ids, setIds ] = useState< string[] >( Object.keys( variables ) );
	const [ autoEditVariableId, setAutoEditVariableId ] = useState< string | undefined >( undefined );

	const [ isSaving, setIsSaving ] = useState( false );

	usePreventUnload( isDirty );

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
								<Stack direction="row" gap={ 0.5 } alignItems="center">
									<VariableManagerPlusMenu onCreate={ createVariable } variables={ variables } />
									<CloseButton
										slotProps={ { icon: { fontSize: SIZE } } }
										onClick={ () => {
											closePanel();
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

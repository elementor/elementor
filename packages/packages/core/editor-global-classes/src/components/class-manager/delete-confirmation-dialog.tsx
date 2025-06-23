import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { type StyleDefinition } from '@elementor/editor-styles';
import { AlertOctagonFilledIcon } from '@elementor/icons';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { deleteClass } from './delete-class';

type DeleteConfirmationDialogProps = Pick< StyleDefinition, 'id' | 'label' >;

type DeleteConfirmationContext = {
	openDialog: ( props: DeleteConfirmationDialogProps ) => void;
	closeDialog: () => void;
	dialogProps: DeleteConfirmationDialogProps | null;
};

const context = createContext< DeleteConfirmationContext | null >( null );

export const DeleteConfirmationProvider = ( { children }: React.PropsWithChildren ) => {
	const [ dialogProps, setDialogProps ] = useState< DeleteConfirmationDialogProps | null >( null );

	const openDialog = ( props: DeleteConfirmationDialogProps ) => {
		setDialogProps( props );
	};

	const closeDialog = () => {
		setDialogProps( null );
	};

	return (
		<context.Provider value={ { openDialog, closeDialog, dialogProps } }>
			{ children }
			{ !! dialogProps && <DeleteConfirmationDialog { ...dialogProps } /> }
		</context.Provider>
	);
};

const TITLE_ID = 'delete-class-dialog';

const DeleteConfirmationDialog = ( { label, id }: DeleteConfirmationDialogProps ) => {
	const { closeDialog } = useDeleteConfirmation();

	const onConfirm = () => {
		deleteClass( id );

		closeDialog();
	};

	return (
		<Dialog open onClose={ closeDialog } aria-labelledby={ TITLE_ID } maxWidth="xs">
			<DialogTitle id={ TITLE_ID } display="flex" alignItems="center" gap={ 1 } sx={ { lineHeight: 1 } }>
				<AlertOctagonFilledIcon color="error" />
				{ __( 'Delete this class?', 'elementor' ) }
			</DialogTitle>
			<DialogContent>
				<DialogContentText variant="body2" color="textPrimary">
					{ __( 'Deleting', 'elementor' ) }
					<Typography variant="subtitle2" component="span">
						&nbsp;{ label }&nbsp;
					</Typography>
					{ __(
						'will permanently remove it from your project and may affect the design across all elements using it. This action cannot be undone.',
						'elementor'
					) }
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button color="secondary" onClick={ closeDialog }>
					{ __( 'Not now', 'elementor' ) }
				</Button>
				<Button variant="contained" color="error" onClick={ onConfirm }>
					{ __( 'Delete', 'elementor' ) }
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export const useDeleteConfirmation = () => {
	const contextValue = useContext( context );

	if ( ! contextValue ) {
		throw new Error( 'useDeleteConfirmation must be used within a DeleteConfirmationProvider' );
	}

	return contextValue;
};

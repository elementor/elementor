import * as React from 'react';
import { createContext, useContext, useState } from 'react';
import { type StyleDefinition } from '@elementor/editor-styles';
import { ConfirmationDialog } from '@elementor/editor-ui';
import { Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useCssClassUsageByID } from '../../hooks/use-css-class-usage-by-id';
import { deleteClass } from './delete-class';

type DeleteClassDialogProps = Pick< StyleDefinition, 'id' | 'label' >;

type DeleteConfirmationContext = {
	openDialog: ( props: DeleteClassDialogProps ) => void;
	closeDialog: () => void;
	dialogProps: DeleteClassDialogProps | null;
};

const context = createContext< DeleteConfirmationContext | null >( null );

export const DeleteConfirmationProvider = ( { children }: React.PropsWithChildren ) => {
	const [ dialogProps, setDialogProps ] = useState< DeleteClassDialogProps | null >( null );

	const openDialog = ( props: DeleteClassDialogProps ) => {
		setDialogProps( props );
	};

	const closeDialog = () => {
		setDialogProps( null );
	};

	return (
		<context.Provider value={ { openDialog, closeDialog, dialogProps } }>
			{ children }
			{ !! dialogProps && <DeleteClassDialog { ...dialogProps } /> }
		</context.Provider>
	);
};

const DeleteClassDialog = ( { label, id }: DeleteClassDialogProps ) => {
	const { closeDialog } = useDeleteConfirmation();
	const {
		data: { total, content },
	} = useCssClassUsageByID( id );

	const handleConfirm = () => {
		closeDialog();
		deleteClass( id );
	};

	// translators: %1: total usage count, %2: number of pages
	const text =
		total && content.length
			? __(
					'Will permanently remove it from your project and may affect the design across all elements using it. Used %1 times across %2 pages. This action cannot be undone.',
					'elementor'
			  )
					.replace( '%1', total.toString() )
					.replace( '%2', content.length.toString() )
			: __(
					'Will permanently remove it from your project and may affect the design across all elements using it. This action cannot be undone.',
					'elementor'
			  );

	return (
		<ConfirmationDialog open onClose={ closeDialog }>
			<ConfirmationDialog.Title>{ __( 'Delete this class?', 'elementor' ) }</ConfirmationDialog.Title>
			<ConfirmationDialog.Content>
				<ConfirmationDialog.ContentText>
					{ __( 'Deleting', 'elementor' ) }
					<Typography variant="subtitle2" component="span">
						&nbsp;{ label }&nbsp;
					</Typography>
					{ text }
				</ConfirmationDialog.ContentText>
			</ConfirmationDialog.Content>
			<ConfirmationDialog.Actions onClose={ closeDialog } onConfirm={ handleConfirm } />
		</ConfirmationDialog>
	);
};

export const useDeleteConfirmation = () => {
	const contextValue = useContext( context );

	if ( ! contextValue ) {
		throw new Error( 'useDeleteConfirmation must be used within a DeleteConfirmationProvider' );
	}

	return contextValue;
};

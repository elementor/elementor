import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, BrushIcon, TrashIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePermissions } from '../hooks/use-permissions';
import { deleteVariable, updateVariable, useVariable } from '../hooks/use-prop-variables';
import { sizeVariablePropTypeUtil } from '../prop-types/size-variable-prop-type';
import { SizeField } from './fields/size-field';
import { LabelField } from './fields/label-field';
import { DeleteConfirmationDialog } from './ui/delete-confirmation-dialog';

const SIZE = 'tiny';

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
};

export const SizeVariableEdit = ( { onClose, onGoBack, onSubmit, editId }: Props ) => {
	const { setValue: notifyBoundPropChange, value: assignedValue } = useBoundProp( sizeVariablePropTypeUtil );
	const [ deleteConfirmation, setDeleteConfirmation ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const variable = useVariable( editId );
	if ( ! variable ) {
		throw new Error( `Global size variable not found` );
	}

	const userPermissions = usePermissions();

	const [ size, setSize ] = useState( variable.value );
	const [ label, setLabel ] = useState( variable.label );

	const handleUpdate = () => {
		updateVariable( editId, {
			value: size,
			label,
		} )
			.then( () => {
				maybeTriggerBoundPropChange();
				onSubmit?.();
			} )
			.catch( ( error ) => {
				setErrorMessage( error.message );
			} );
	};

	const handleDelete = () => {
		deleteVariable( editId ).then( () => {
			maybeTriggerBoundPropChange();
			onSubmit?.();
		} );
	};

	const maybeTriggerBoundPropChange = () => {
		if ( editId === assignedValue ) {
			notifyBoundPropChange( editId );
		}
	};

	const handleDeleteConfirmation = () => {
		setDeleteConfirmation( true );
	};

	const closeDeleteDialog = () => () => {
		setDeleteConfirmation( false );
	};

	const actions = [];

	if ( userPermissions.canDelete() ) {
		actions.push(
			<IconButton
				key="delete"
				size={ SIZE }
				aria-label={ __( 'Delete', 'elementor' ) }
				onClick={ handleDeleteConfirmation }
			>
				<TrashIcon fontSize={ SIZE } />
			</IconButton>
		);
	}

	const hasEmptyValues = () => {
		return ! size.trim() || ! label.trim();
	};

	const noValueChanged = () => {
		return size === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyValues() || hasErrors();

	return (
		<>
			<PopoverBody height="auto">
				<PopoverHeader
					title={ __( 'Edit variable', 'elementor' ) }
					onClose={ onClose }
					icon={
						<>
							{ onGoBack && (
								<IconButton
									size={ SIZE }
									aria-label={ __( 'Go Back', 'elementor' ) }
									onClick={ onGoBack }
								>
									<ArrowLeftIcon fontSize={ SIZE } />
								</IconButton>
							) }
							<BrushIcon fontSize={ SIZE } />
						</>
					}
					actions={ actions }
				/>

				<Divider />

				<PopoverContent p={ 2 }>
					<LabelField
						value={ label }
						onChange={ ( value ) => {
							setLabel( value );
							setErrorMessage( '' );
						} }
					/>
					<SizeField
						value={ size }
						onChange={ ( value ) => {
							setSize( value );
							setErrorMessage( '' );
						} }
					/>

					{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
				</PopoverContent>

				<CardActions sx={ { pt: 0.5, pb: 1 } }>
					<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleUpdate }>
						{ __( 'Save', 'elementor' ) }
					</Button>
				</CardActions>
			</PopoverBody>

			{ deleteConfirmation && (
				<DeleteConfirmationDialog
					open
					label={ label }
					onConfirm={ handleDelete }
					closeDialog={ closeDeleteDialog() }
				/>
			) }
		</>
	);
};

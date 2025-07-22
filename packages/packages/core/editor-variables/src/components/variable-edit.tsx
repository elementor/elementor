import { useState } from 'react';
import * as React from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverBody } from '@elementor/editor-editing-panel';
import type { PropTypeUtil } from '@elementor/editor-props';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, TrashIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { usePermissions } from '../hooks/use-permissions';
import { deleteVariable, updateVariable, useVariable } from '../hooks/use-prop-variables';
import { getVariable } from '../variable-registry';
import { LabelField } from './fields/label-field';
import { DeleteConfirmationDialog } from './ui/delete-confirmation-dialog';

const SIZE = 'tiny';

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
	propTypeUtil: PropTypeUtil< string, string >;
};

export const VariableEdit = ( { onClose, onGoBack, onSubmit, editId, propTypeUtil }: Props ) => {
	const { setValue: notifyBoundPropChange, value: assignedValue } = useBoundProp( propTypeUtil );
	const [ deleteConfirmation, setDeleteConfirmation ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const { icon: VariableIcon, valueField: ValueField } = getVariable( propTypeUtil.key );

	const variable = useVariable( editId );

	if ( ! variable ) {
		throw new Error( `Global variable not found` );
	}

	const userPermissions = usePermissions();

	const [ value, setValue ] = useState( variable.value );
	const [ label, setLabel ] = useState( variable.label );

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

	const hasEmptyValues = () => {
		return ! value.trim() || ! label.trim();
	};

	const noValueChanged = () => {
		return value === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyValues() || hasErrors();

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

	const handleUpdate = () => {
		updateVariable( editId, {
			value,
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
							<VariableIcon fontSize={ SIZE } />
						</>
					}
					actions={ actions }
				/>

				<Divider />

				<PopoverContent p={ 2 }>
					<LabelField
						value={ label }
						onChange={ ( newValue ) => {
							setLabel( newValue );
							setErrorMessage( '' );
						} }
					/>
					<ValueField
						value={ value }
						onChange={ ( newValue ) => {
							setValue( newValue );
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

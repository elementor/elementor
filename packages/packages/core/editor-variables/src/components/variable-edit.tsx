import * as React from 'react';
import { type KeyboardEvent, useEffect, useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { useSuppressedMessage } from '@elementor/editor-current-user';
import { PopoverBody } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, TrashIcon } from '@elementor/icons';
import { Button, CardActions, Divider, FormHelperText, IconButton, Tooltip, Typography } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { useVariableType } from '../context/variable-type-context';
import { usePermissions } from '../hooks/use-permissions';
import { deleteVariable, updateVariable, useVariable } from '../hooks/use-prop-variables';
import { useVariableBoundProp } from '../hooks/use-variable-bound-prop';
import { styleVariablesRepository } from '../style-variables-repository';
import { ERROR_MESSAGES, labelHint, mapServerError } from '../utils/validations';
import { LabelField, useLabelError } from './fields/label-field';
import { DeleteConfirmationDialog } from './ui/delete-confirmation-dialog';
import { EDIT_CONFIRMATION_DIALOG_ID, EditConfirmationDialog } from './ui/edit-confirmation-dialog';
import { FormField } from './ui/form-field';

const SIZE = 'tiny';
const DELETE_LABEL = __( 'Delete variable', 'elementor' );

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
};

export const VariableEdit = ( { onClose, onGoBack, onSubmit, editId }: Props ) => {
	const { icon: VariableIcon, valueField: ValueField, variableType, propTypeUtil } = useVariableType();

	const { setVariableValue: notifyBoundPropChange, variableId } = useVariableBoundProp();
	const { propType } = useBoundProp();
	const [ isMessageSuppressed, suppressMessage ] = useSuppressedMessage( EDIT_CONFIRMATION_DIALOG_ID );
	const [ deleteConfirmation, setDeleteConfirmation ] = useState( false );
	const [ editConfirmation, setEditConfirmation ] = useState( false );
	const [ errorMessage, setErrorMessage ] = useState( '' );
	const [ valueFieldError, setValueFieldError ] = useState( '' );

	const { labelFieldError, setLabelFieldError } = useLabelError();
	const variable = useVariable( editId );

	const [ propTypeKey, setPropTypeKey ] = useState( variable?.type ?? propTypeUtil.key );

	if ( ! variable ) {
		throw new Error( `Global ${ variableType } variable not found` );
	}

	const userPermissions = usePermissions();

	const [ value, setValue ] = useState( () => variable.value );
	const [ label, setLabel ] = useState( () => variable.label );

	useEffect( () => {
		styleVariablesRepository.update( {
			[ editId ]: {
				...variable,
				value,
			},
		} );

		return () => {
			styleVariablesRepository.update( {
				[ editId ]: { ...variable },
			} );
		};
	}, [ editId, value, variable ] );

	const handleUpdate = () => {
		if ( isMessageSuppressed ) {
			handleSaveVariable();
		} else {
			setEditConfirmation( true );
		}
	};

	const handleSaveVariable = () => {
		const typeChanged = propTypeKey !== variable.type;
		const updatePayload = typeChanged ? { value, label, type: propTypeKey } : { value, label };

		updateVariable( editId, updatePayload )
			.then( () => {
				maybeTriggerBoundPropChange();
				onSubmit?.();
			} )
			.catch( ( error ) => {
				const mappedError = mapServerError( error );
				if ( mappedError && 'label' === mappedError.field ) {
					setLabel( '' );
					setLabelFieldError( {
						value: label,
						message: mappedError.message,
					} );
					return;
				}

				setErrorMessage( ERROR_MESSAGES.UNEXPECTED_ERROR );
			} );
	};

	const handleDelete = () => {
		deleteVariable( editId ).then( () => {
			maybeTriggerBoundPropChange();
			onSubmit?.();
		} );
	};

	const maybeTriggerBoundPropChange = () => {
		if ( editId === variableId ) {
			notifyBoundPropChange( editId );
		}
	};

	const handleDeleteConfirmation = () => {
		setDeleteConfirmation( true );
	};

	const closeDeleteDialog = () => () => {
		setDeleteConfirmation( false );
	};

	const closeEditDialog = () => () => {
		setEditConfirmation( false );
	};

	const actions = [];

	if ( userPermissions.canDelete() ) {
		actions.push(
			<Tooltip key="delete" placement="top" title={ DELETE_LABEL }>
				<IconButton size={ SIZE } onClick={ handleDeleteConfirmation } aria-label={ DELETE_LABEL }>
					<TrashIcon fontSize={ SIZE } />
				</IconButton>
			</Tooltip>
		);
	}

	const hasEmptyFields = () => {
		if ( '' === label.trim() ) {
			return true;
		}

		if ( 'string' === typeof value ) {
			return '' === value.trim();
		}

		return false === Boolean( value );
	};

	const noValueChanged = () => {
		return value === variable.value && label === variable.label;
	};

	const hasErrors = () => {
		return !! errorMessage;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyFields() || hasErrors();

	const handleKeyDown = ( event: KeyboardEvent< HTMLElement > ) => {
		if ( event.key === 'Enter' && ! isSubmitDisabled ) {
			event.preventDefault();
			handleUpdate();
		}
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
					<FormField
						id="variable-label"
						label={ __( 'Name', 'elementor' ) }
						errorMsg={ labelFieldError?.message }
						noticeMsg={ labelHint( label ) }
					>
						<LabelField
							id="variable-label"
							value={ label }
							error={ labelFieldError }
							onChange={ ( newValue ) => {
								setLabel( newValue );
								setErrorMessage( '' );
							} }
							onErrorChange={ ( errorMsg ) => {
								setLabelFieldError( {
									value: label,
									message: errorMsg,
								} );
							} }
							onKeyDown={ handleKeyDown }
						/>
					</FormField>
					{ ValueField && (
						<FormField errorMsg={ valueFieldError } label={ __( 'Value', 'elementor' ) }>
							<Typography variant="h5">
								<ValueField
									propTypeKey={ variable.type }
									onPropTypeKeyChange={ ( key: string ) => setPropTypeKey( key ) }
									value={ value }
									onChange={ ( newValue ) => {
										setValue( newValue );
										setErrorMessage( '' );
										setValueFieldError( '' );
									} }
									onKeyDown={ handleKeyDown }
									onValidationChange={ setValueFieldError }
									propType={ propType }
								/>
							</Typography>
						</FormField>
					) }

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

			{ editConfirmation && ! isMessageSuppressed && (
				<EditConfirmationDialog
					closeDialog={ closeEditDialog() }
					onConfirm={ handleSaveVariable }
					onSuppressMessage={ suppressMessage }
				/>
			) }
		</>
	);
};

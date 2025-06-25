import * as React from 'react';
import { useState } from 'react';
import { PopoverContent, useBoundProp } from '@elementor/editor-controls';
import { PopoverScrollableContent } from '@elementor/editor-editing-panel';
import { PopoverHeader } from '@elementor/editor-ui';
import { ArrowLeftIcon, TextIcon, TrashIcon } from '@elementor/icons';
import { Button, CardActions, Divider, IconButton } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { deleteVariable, updateVariable, useVariable } from '../hooks/use-prop-variables';
import { fontVariablePropTypeUtil } from '../prop-types/font-variable-prop-type';
import { FontField } from './fields/font-field';
import { LabelField } from './fields/label-field';
import { DeleteConfirmationDialog } from './ui/delete-confirmation-dialog';

const SIZE = 'tiny';

type Props = {
	editId: string;
	onClose: () => void;
	onGoBack?: () => void;
	onSubmit?: () => void;
};

export const FontVariableEdit = ( { onClose, onGoBack, onSubmit, editId }: Props ) => {
	const { setValue: notifyBoundPropChange, value: assignedValue } = useBoundProp( fontVariablePropTypeUtil );
	const [ deleteConfirmation, setDeleteConfirmation ] = useState( false );

	const variable = useVariable( editId );
	if ( ! variable ) {
		throw new Error( `Global font variable "${ editId }" not found` );
	}

	const [ fontFamily, setFontFamily ] = useState( variable.value );
	const [ label, setLabel ] = useState( variable.label );

	const handleUpdate = () => {
		updateVariable( editId, {
			value: fontFamily,
			label,
		} ).then( () => {
			maybeTriggerBoundPropChange();
			onSubmit?.();
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

	const hasEmptyValue = () => {
		return ! fontFamily.trim() || ! label.trim();
	};

	const noValueChanged = () => {
		return fontFamily === variable.value && label === variable.label;
	};

	const isSubmitDisabled = noValueChanged() || hasEmptyValue();

	const actions = [];

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

	return (
		<>
			<PopoverScrollableContent height="auto">
				<PopoverHeader
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
							<TextIcon fontSize={ SIZE } />
						</>
					}
					title={ __( 'Edit variable', 'elementor' ) }
					onClose={ onClose }
					actions={ actions }
				/>

				<Divider />

				<PopoverContent p={ 2 }>
					<LabelField value={ label } onChange={ setLabel } />
					<FontField value={ fontFamily } onChange={ setFontFamily } />
				</PopoverContent>

				<CardActions sx={ { pt: 0.5, pb: 1 } }>
					<Button size="small" variant="contained" disabled={ isSubmitDisabled } onClick={ handleUpdate }>
						{ __( 'Save', 'elementor' ) }
					</Button>
				</CardActions>
			</PopoverScrollableContent>

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

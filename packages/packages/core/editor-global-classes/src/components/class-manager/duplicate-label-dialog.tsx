import * as React from 'react';
import { closeDialog } from '@elementor/editor-global-dialog';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import { EditableField, useEditable } from '@elementor/editor-ui';
import { __useDispatch as useDispatch } from '@elementor/store';
import { Button, Typography } from '@elementor/ui';

import { useCssClassById } from '../../hooks/use-css-class-by-id';
import { slice } from '../../store';
import { ClassItem } from './class-item';

export const DuplicatLabelDialog = ( { id } ) => {
	const dispatch = useDispatch();

	const renameClass = ( newLabel: string ) => {
		dispatch(
			slice.actions.update( {
				style: {
					id,
					label: newLabel,
				},
			} )
		);
	};

	const cssClass = useCssClassById( id );
	console.log( { cssClass } );
	const {
		ref: editableRef,
		getProps: getEditableProps,
		openEditMode,
	} = useEditable( {
		value: cssClass.label,
		onSubmit: renameClass,
		validation: validateLabel,
	} );
	return (
		<>
			<h1>{ id }</h1>
			<div>
				<EditableField ref={ editableRef } />
			</div>
			{ JSON.stringify( cssClass, null, 2 ) }
			<Button variant="text" onClick={ () => closeDialog() }>
				Cancel
			</Button>
			<Button variant="contained" color="error" onClick={ () => closeDialog() }>
				Delete
			</Button>
		</>
	);
};

const validateLabel = ( newLabel: string ) => {
	const result = validateStyleLabel( newLabel, 'rename' );

	if ( result.isValid ) {
		return null;
	}

	return result.errorMessage;
};

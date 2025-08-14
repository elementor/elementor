import * as React from 'react';
import { useState } from 'react';
import { ClickAwayListener, Stack } from '@elementor/ui';

import { type ValueFieldProps } from '../../variables-registry/create-variable-type-registry';

export const VariableEditableCell = ( {
	initialValue,
	children,
	editableElement,
	onSave,
	prefixElement,
	disableCloseOnBlur,
}: {
	initialValue: string;
	children: React.ReactNode;
	editableElement: ( { value, onChange, onValidationChange }: ValueFieldProps ) => JSX.Element;
	onSave: ( newValue: string ) => void;
	prefixElement?: React.ReactNode;
	disableCloseOnBlur?: boolean;
} ) => {
	const [ value, setValue ] = useState( initialValue );
	const [ isEditing, setIsEditing ] = useState( false );

	const handleDoubleClick = () => {
		setIsEditing( true );
	};

	const handleSave = () => {
		onSave( value );
		setIsEditing( false );
	};

	const handleKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
		if ( event.key === 'Enter' ) {
			handleSave();
		} else if ( event.key === 'Escape' ) {
			setIsEditing( false );
		}
		if ( event.key === ' ' && ! isEditing ) {
			event.preventDefault();
			setIsEditing( true );
		}
	};

	const handleChange = ( newValue: string ) => {
		setValue( newValue );
	};

	const editableContent = editableElement( { value, onChange: handleChange } );

	return (
		<ClickAwayListener onClickAway={ handleSave }>
			<Stack
				direction="row"
				alignItems="center"
				gap={ 1 }
				onDoubleClick={ handleDoubleClick }
				onBlur={ disableCloseOnBlur ? undefined : handleSave }
				onKeyDown={ handleKeyDown }
				tabIndex={ 0 }
				role="button"
				aria-label="Double click or press Space to edit"
			>
				{ prefixElement }
				{ isEditing ? editableContent : children }
			</Stack>
		</ClickAwayListener>
	);
};

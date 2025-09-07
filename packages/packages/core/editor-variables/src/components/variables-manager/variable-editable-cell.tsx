import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { ClickAwayListener, Stack } from '@elementor/ui';

import { type ValueFieldProps } from '../../variables-registry/create-variable-type-registry';

type VariableEditableCellProps = {
	initialValue: string;
	children: React.ReactNode;
	editableElement: ( { value, onChange, onValidationChange }: ValueFieldProps ) => JSX.Element;
	onChange: ( newValue: string ) => void;
	prefixElement?: React.ReactNode;
	autoEdit?: boolean;
	onRowRef?: ( ref: HTMLTableRowElement | null ) => void;
	onAutoEditComplete?: () => void;
};

export const VariableEditableCell = ( {
	initialValue,
	children,
	editableElement,
	onChange,
	prefixElement,
	autoEdit = false,
	onRowRef,
	onAutoEditComplete,
}: VariableEditableCellProps ) => {
	const [ value, setValue ] = useState( initialValue );
	const [ isEditing, setIsEditing ] = useState( false );

	const rowRef = useRef< HTMLTableRowElement >( null );

	useEffect( () => {
		onRowRef?.( rowRef?.current );
	}, [ onRowRef ] );

	useEffect( () => {
		if ( autoEdit && ! isEditing ) {
			setIsEditing( true );
			onAutoEditComplete?.();
		}
	}, [ autoEdit, isEditing, onAutoEditComplete ] );

	const handleDoubleClick = () => {
		setIsEditing( true );
	};

	const handleSave = () => {
		onChange( value );
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

	if ( isEditing ) {
		return (
			<ClickAwayListener onClickAway={ handleSave }>
				<Stack
					ref={ rowRef }
					direction="row"
					alignItems="center"
					gap={ 1 }
					onDoubleClick={ handleDoubleClick }
					onKeyDown={ handleKeyDown }
					tabIndex={ 0 }
					role="button"
					aria-label="Double click or press Space to edit"
				>
					{ prefixElement }
					{ editableContent }
				</Stack>
			</ClickAwayListener>
		);
	}

	return (
		<Stack
			ref={ rowRef }
			direction="row"
			alignItems="center"
			gap={ 1 }
			onDoubleClick={ handleDoubleClick }
			onKeyDown={ handleKeyDown }
			tabIndex={ 0 }
			role="button"
			aria-label="Double click or press Space to edit"
		>
			{ prefixElement }
			{ children }
		</Stack>
	);
};

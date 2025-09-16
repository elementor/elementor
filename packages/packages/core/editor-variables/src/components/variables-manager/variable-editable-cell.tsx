import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ClickAwayListener, Stack } from '@elementor/ui';

import { type ValueFieldProps } from '../../variables-registry/create-variable-type-registry';
import { useLabelError } from '../fields/label-field';

type VariableEditableCellProps = {
	initialValue: string;
	children: React.ReactNode;
	editableElement: ( { value, onChange, onValidationChange, error }: ValueFieldProps ) => JSX.Element;
	onChange: ( newValue: string ) => void;
	prefixElement?: React.ReactNode;
	autoEdit?: boolean;
	onRowRef?: ( ref: HTMLTableRowElement | null ) => void;
	onAutoEditComplete?: () => void;
	gap?: number;
	fieldType?: 'label' | 'value';
};

export const VariableEditableCell = React.memo(
	( {
		initialValue,
		children,
		editableElement,
		onChange,
		prefixElement,
		autoEdit = false,
		onRowRef,
		onAutoEditComplete,
		gap,
		fieldType,
	}: VariableEditableCellProps ) => {
		const [ value, setValue ] = useState( initialValue );
		const [ isEditing, setIsEditing ] = useState( false );

		const { labelFieldError, setLabelFieldError } = useLabelError();

		const rowRef = useRef< HTMLTableRowElement >( null );

		const handleSave = useCallback( () => {
			onChange( value );
			setIsEditing( false );
		}, [ value, onChange ] );

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

		const handleChange = useCallback( ( newValue: string ) => {
			setValue( newValue );
		}, [] );

		const handleValidationChange = useCallback(
			( errorMsg: string ) => {
				if ( fieldType === 'label' ) {
					setLabelFieldError( {
						value,
						message: errorMsg,
					} );
				}
			},
			[ fieldType, value, setLabelFieldError ]
		);

		const currentError = fieldType === 'label' ? labelFieldError : undefined;

		const editableContent = editableElement( {
			value,
			onChange: handleChange,
			onValidationChange: handleValidationChange,
			error: currentError,
		} );

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
	}
);

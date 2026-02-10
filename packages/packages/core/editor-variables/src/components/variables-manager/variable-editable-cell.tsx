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
	disabled?: boolean;
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
		gap = 1,
		fieldType,
		disabled = false,
	}: VariableEditableCellProps ) => {
		const [ value, setValue ] = useState( initialValue );
		const [ isEditing, setIsEditing ] = useState( false );

		const { labelFieldError, setLabelFieldError } = useLabelError();
		const [ valueFieldError, setValueFieldError ] = useState( '' );

		const rowRef = useRef< HTMLTableRowElement >( null );

		const handleSave = useCallback( () => {
			const hasError =
				( fieldType === 'label' && labelFieldError?.message ) || ( fieldType === 'value' && valueFieldError );

			if ( ! hasError ) {
				onChange( value );
			}
			setIsEditing( false );
		}, [ value, onChange, fieldType, labelFieldError, valueFieldError ] );

		useEffect( () => {
			onRowRef?.( rowRef?.current );
		}, [ onRowRef ] );

		useEffect( () => {
			if ( autoEdit && ! isEditing && ! disabled ) {
				setIsEditing( true );
				onAutoEditComplete?.();
			}
		}, [ autoEdit, isEditing, onAutoEditComplete, disabled ] );

		const handleDoubleClick = () => {
			if ( disabled ) {
				return;
			}
			setIsEditing( true );
		};

		const handleKeyDown = ( event: React.KeyboardEvent< HTMLDivElement > ) => {
			if ( disabled ) {
				return;
			}
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
				} else {
					setValueFieldError( errorMsg );
				}
			},
			[ fieldType, value, setLabelFieldError, setValueFieldError ]
		);

		let currentError;
		if ( fieldType === 'label' ) {
			currentError = labelFieldError;
		} else if ( fieldType === 'value' ) {
			currentError = { value, message: valueFieldError };
		}

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
						gap={ gap }
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
				gap={ gap }
				onDoubleClick={ handleDoubleClick }
				onKeyDown={ handleKeyDown }
				tabIndex={ disabled ? -1 : 0 }
				role="button"
				aria-label={ disabled ? '' : 'Double click or press Space to edit' }
			>
				{ prefixElement }
				{ children }
			</Stack>
		);
	}
);

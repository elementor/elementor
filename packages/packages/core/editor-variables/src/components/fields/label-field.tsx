import * as React from 'react';
import { type KeyboardEvent, useRef, useState } from 'react';
import { WarningInfotip } from '@elementor/editor-ui';
import { TextField, type TextFieldProps } from '@elementor/ui';

import { type TVariablesList } from '../../storage';
import { labelHint, validateLabel, VARIABLE_LABEL_MAX_LENGTH } from '../../utils/validations';
function isLabelEqual( a: string, b: string ) {
	return a.trim().toLowerCase() === b.trim().toLowerCase();
}

type LabelErrorProps = {
	value: string;
	message: string;
};

export const useLabelError = ( initialError?: LabelErrorProps ) => {
	const [ error, setError ] = useState< LabelErrorProps >( initialError ?? { value: '', message: '' } );

	return {
		labelFieldError: error,
		setLabelFieldError: setError,
	};
};

export type LabelFieldProps = {
	value: string;
	error?: LabelErrorProps;
	onChange: ( value: string ) => void;
	id?: string;
	onErrorChange?: ( errorMsg: string ) => void;
	size?: TextFieldProps[ 'size' ];
	focusOnShow?: boolean;
	selectOnShow?: boolean;
	showWarningInfotip?: boolean;
	variables?: TVariablesList;
	onKeyDown?: ( event: KeyboardEvent< HTMLInputElement > ) => void;
};

export const LabelField = ( {
	value,
	error,
	onChange,
	id,
	onErrorChange,
	size = 'tiny',
	focusOnShow = false,
	selectOnShow = false,
	showWarningInfotip = false,
	variables,
	onKeyDown,
}: LabelFieldProps ) => {
	const [ label, setLabel ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const fieldRef = useRef< HTMLElement >( null );

	const handleChange = ( newValue: string ) => {
		setLabel( newValue );

		const errorMsg = validateLabel( newValue, variables );

		setErrorMessage( errorMsg );
		onErrorChange?.( errorMsg );

		onChange( isLabelEqual( newValue, error?.value ?? '' ) || errorMsg ? '' : newValue );
	};

	let errorMsg = errorMessage;
	if ( isLabelEqual( label, error?.value ?? '' ) && error?.message ) {
		errorMsg = error.message;
	}

	const hintMsg = ! errorMsg ? labelHint( label ) : '';

	const textField = (
		<TextField
			ref={ fieldRef }
			id={ id }
			size={ size }
			fullWidth
			value={ label }
			error={ !! errorMsg }
			onChange={ ( e: React.ChangeEvent< HTMLInputElement > ) => handleChange( e.target.value ) }
			inputProps={ {
				maxLength: VARIABLE_LABEL_MAX_LENGTH,
				...( selectOnShow && { onFocus: ( e: React.FocusEvent< HTMLInputElement > ) => e.target.select() } ),
				'aria-label': 'Name',
				onKeyDown,
			} }
			// eslint-disable-next-line jsx-a11y/no-autofocus
			autoFocus={ focusOnShow }
		/>
	);

	if ( showWarningInfotip ) {
		const tooltipWidth = Math.max( 240, fieldRef.current?.getBoundingClientRect().width ?? 240 );

		return (
			<WarningInfotip
				open={ Boolean( errorMsg || hintMsg ) }
				text={ errorMsg || hintMsg }
				placement="bottom-start"
				width={ tooltipWidth }
				offset={ [ 0, -15 ] }
				{ ...( hintMsg && { hasError: false } ) }
			>
				{ textField }
			</WarningInfotip>
		);
	}

	return textField;
};

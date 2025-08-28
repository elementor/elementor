import * as React from 'react';
import { useRef, useState } from 'react';
import { UnstableColorField } from '@elementor/ui';

import { usePopoverContentRef } from '../../context/variable-selection-popover.context';
import { validateValue } from '../../utils/validations';

type ColorFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	onValidationChange?: ( errorMessage: string ) => void;
};

export const ColorField = ( { value, onChange, onValidationChange }: ColorFieldProps ) => {
	const [ color, setColor ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const defaultRef = useRef< HTMLDivElement >( null );
	const anchorRef = usePopoverContentRef() ?? defaultRef.current;

	const handleChange = ( newValue: string ) => {
		setColor( newValue );

		const errorMsg = validateValue( newValue );
		setErrorMessage( errorMsg );
		onValidationChange?.( errorMsg );

		onChange( errorMsg ? '' : newValue );
	};

	return (
		<UnstableColorField
			size="tiny"
			fullWidth
			value={ color }
			onChange={ handleChange }
			error={ errorMessage || undefined }
			slotProps={ {
				colorPicker: {
					anchorEl: anchorRef,
					anchorOrigin: { vertical: 'top', horizontal: 'right' },
					transformOrigin: { vertical: 'top', horizontal: -10 },
					slotProps: {
						colorIndicator: {
							size: 'inherit',
							sx: {
								borderRadius: 0.5,
							},
						},
					},
				},
			} }
		/>
	);
};

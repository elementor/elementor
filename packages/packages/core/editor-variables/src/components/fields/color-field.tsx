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
			id="color-variable-field"
			size="tiny"
			fullWidth
			value={ color }
			onChange={ handleChange }
			error={ errorMessage || undefined }
			slotProps={ {
				colorPicker: {
					// @ts-expect-error TS7 migration: anchor may be a RefObject
					anchorEl: anchorRef,
					anchorOrigin: { vertical: 'top', horizontal: 'right' },
					transformOrigin: { vertical: 'top', horizontal: -10 },
					slotProps: {
						colorIndicator: {
							// @ts-expect-error TS7 migration: aria-label missing from ColorIndicatorProps
							'aria-label': 'Color indicator',
							size: 'inherit',
							sx: {
								borderRadius: 0.5,
							},
						},
						colorBox: {
							slotProps: {
								formatSelection: {
									MenuProps: { disablePortal: true },
								},
							},
						},
					},
				},
			} }
		/>
	);
};

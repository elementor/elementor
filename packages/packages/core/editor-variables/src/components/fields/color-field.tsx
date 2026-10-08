import * as React from 'react';
import { useMemo, useRef, useState } from 'react';
import { createTheme, ThemeProvider, UnstableColorField, useTheme } from '@elementor/ui';

import { usePopoverContentRef } from '../../context/variable-selection-popover.context';
import { validateValue } from '../../utils/validations';
import { COLOR_VARIABLE_FIELD_ID } from './color-variable-field-constants';

type ColorFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	onValidationChange?: ( errorMessage: string ) => void;
};

const ColorFieldSelectPortalThemeProvider = ( { children }: { children: React.ReactNode } ) => {
	const parentTheme = useTheme();

	const theme = useMemo(
		() =>
			createTheme( parentTheme, {
				components: {
					MuiSelect: {
						defaultProps: {
							MenuProps: {
								disablePortal: true,
							},
						},
					},
				},
			} ),
		[ parentTheme ]
	);

	return <ThemeProvider theme={ theme }>{ children }</ThemeProvider>;
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
		<ColorFieldSelectPortalThemeProvider>
			<UnstableColorField
				id={ COLOR_VARIABLE_FIELD_ID }
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
		</ColorFieldSelectPortalThemeProvider>
	);
};

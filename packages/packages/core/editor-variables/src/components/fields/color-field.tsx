/* eslint-disable local-rules/no-path-imports -- ColorInput is not exported from @elementor/ui root */
import * as React from 'react';
import { useRef, useState } from 'react';
import { styled, useThemeProps } from '@elementor/ui';
import ColorInput from '@elementor/ui/unstable/components/ColorField/components/ColorInput';

import { usePopoverContentRef } from '../../context/variable-selection-popover.context';
import { validateValue } from '../../utils/validations';
import { VariablesColorPicker } from './variables-color-picker';

type ColorFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
	onValidationChange?: ( errorMessage: string ) => void;
};

const Root = styled( 'div' )( ( { theme } ) => ( {
	display: 'flex',
	alignItems: 'center',
	gap: theme.spacing( 1 ),
} ) );

export const ColorField = ( { value, onChange, onValidationChange }: ColorFieldProps ) => {
	const [ color, setColor ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const defaultRef = useRef< HTMLDivElement >( null );
	const anchorRef = usePopoverContentRef() ?? defaultRef.current;

	const rootProps = useThemeProps( { props: { size: 'tiny' as const }, name: 'MuiColorField' } );

	const handleChange = ( newValue: string ) => {
		setColor( newValue );

		const errorMsg = validateValue( newValue );
		setErrorMessage( errorMsg );
		onValidationChange?.( errorMsg );

		onChange( errorMsg ? '' : newValue );
	};

	return (
		<Root id="color-variable-field">
			<VariablesColorPicker
				value={ color }
				onChange={ handleChange }
				size="tiny"
				disabled={ false }
				anchorEl={ anchorRef }
				anchorOrigin={ { vertical: 'top', horizontal: 'right' } }
				transformOrigin={ { vertical: 'top', horizontal: -10 } }
				slotProps={ {
					colorIndicator: {
						size: 'inherit',
						sx: {
							borderRadius: 0.5,
						},
					},
					popover: {
						disableRestoreFocus: true,
					},
				} }
			/>
			<ColorInput
				{ ...rootProps }
				fullWidth
				value={ color }
				onChange={ handleChange }
				error={ errorMessage || undefined }
				placeholder={ undefined }
				disabled={ false }
			/>
		</Root>
	);
};

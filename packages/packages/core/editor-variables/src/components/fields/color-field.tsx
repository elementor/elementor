import * as React from 'react';
import { useRef, useState } from 'react';
import { FormHelperText, FormLabel, Grid, UnstableColorField } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { validateValue } from '../../utils/validations';
import { usePopoverContentRef } from '../variable-selection-popover.context';

type ColorFieldProps = {
	value: string;
	onChange: ( value: string ) => void;
};

export const ColorField = ( { value, onChange }: ColorFieldProps ) => {
	const [ color, setColor ] = useState( value );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	const defaultRef = useRef< HTMLDivElement >( null );
	const anchorRef = usePopoverContentRef() ?? defaultRef.current;

	const handleChange = ( newValue: string ) => {
		setColor( newValue );

		const errorMsg = validateValue( newValue );
		setErrorMessage( errorMsg );

		onChange( errorMsg ? '' : newValue );
	};

	return (
		<Grid container gap={ 0.75 } alignItems="center">
			<Grid item xs={ 12 }>
				<FormLabel size="tiny">{ __( 'Value', 'elementor' ) }</FormLabel>
			</Grid>
			<Grid item xs={ 12 }>
				<UnstableColorField
					size="tiny"
					fullWidth
					value={ color }
					onChange={ handleChange }
					error={ errorMessage ?? undefined }
					slotProps={ {
						colorPicker: {
							anchorEl: anchorRef,
							anchorOrigin: { vertical: 'top', horizontal: 'right' },
							transformOrigin: { vertical: 'top', horizontal: -10 },
						},
					} }
				/>
				{ errorMessage && <FormHelperText error>{ errorMessage }</FormHelperText> }
			</Grid>
		</Grid>
	);
};

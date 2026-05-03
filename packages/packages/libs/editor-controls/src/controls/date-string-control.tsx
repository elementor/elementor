import * as React from 'react';
import type { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';
import { dateStringPropTypeUtil } from '@elementor/editor-props';
import { DatePicker, LocalizationProvider } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type DateStringControlProps = {
	inputDisabled?: boolean;
	ariaLabel?: string;
	error?: boolean;
};

const DATE_FORMAT = 'YYYY-MM-DD';

export const DateStringControl = createControl( ( { inputDisabled, ariaLabel, error }: DateStringControlProps ) => {
	const { value, setValue, disabled } = useBoundProp( dateStringPropTypeUtil );

	const isDisabled = inputDisabled ?? disabled;

	const slotProps = {
		textField: {
			size: 'tiny' as const,
			fullWidth: true,
			error,
			inputProps: ariaLabel ? { 'aria-label': ariaLabel } : undefined,
		},
		openPickerButton: { size: 'tiny' as const },
		openPickerIcon: { fontSize: 'tiny' as const },
	};

	const handleChange = ( newValue: Dayjs | null, format: string ) => {
		if ( ! newValue ) {
			setValue( null );
			return;
		}

		setValue( newValue.format( format ) );
	};

	return (
		<LocalizationProvider>
			<ControlActions>
				<DatePicker
					value={ parseDateString( value ?? '' ) }
					onChange={ ( newValue: Dayjs | null ) => handleChange( newValue, DATE_FORMAT ) }
					disabled={ isDisabled }
					slotProps={ slotProps }
				/>
			</ControlActions>
		</LocalizationProvider>
	);
} );

function parseDateString( raw: string ): Dayjs | null {
	if ( ! raw ) {
		return null;
	}

	const parsed = ( dayjs as unknown as { default: ( s?: string | number | Date ) => Dayjs } ).default( raw );

	return isValidDayjs( parsed ) ? parsed : null;
}

function isValidDayjs( value: Dayjs | null ): value is Dayjs {
	return !! value && typeof value.isValid === 'function' && value.isValid();
}

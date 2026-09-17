import * as React from 'react';
import type { Dayjs } from 'dayjs';
import { dateStringPropTypeUtil } from '@elementor/editor-props';
import { DatePicker, LocalizationProvider } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { DATE_FORMAT, isValidDayjs, parseDateString } from '../utils/date-time';

type DateStringControlProps = {
	inputDisabled?: boolean;
	ariaLabel?: string;
	error?: boolean;
	coerceInvalidToNull?: boolean;
};

export const DateStringControl = createControl(
	( { inputDisabled, ariaLabel, error, coerceInvalidToNull = false }: DateStringControlProps ) => {
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

			if ( coerceInvalidToNull && ! isValidDayjs( newValue ) ) {
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
	}
);

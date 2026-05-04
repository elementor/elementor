import * as React from 'react';
import type { Dayjs } from 'dayjs';
import { dateStringPropTypeUtil } from '@elementor/editor-props';
import { DatePicker, LocalizationProvider } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { DATE_FORMAT, INVALID_DATE, parseDateString } from '../utils/date-time';

type DateStringControlProps = {
	inputDisabled?: boolean;
	ariaLabel?: string;
	error?: boolean;
	coerceInvalidToEmpty?: boolean;
};

export const DateStringControl = createControl(
	( { inputDisabled, ariaLabel, error, coerceInvalidToEmpty = false }: DateStringControlProps ) => {
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

			const formatted = newValue.format( format );

			if ( coerceInvalidToEmpty && formatted === INVALID_DATE ) {
				setValue( '' );
				return;
			}

			setValue( formatted );
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

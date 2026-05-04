import * as React from 'react';
import type { Dayjs } from 'dayjs';
import { timeStringPropTypeUtil } from '@elementor/editor-props';
import { LocalizationProvider, TimePicker } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';
import { INVALID_DATE, parseTimeString, TIME_FORMAT } from '../utils/date-time';

type TimeStringControlProps = {
	inputDisabled?: boolean;
	ariaLabel?: string;
	error?: boolean;
	coerceInvalidToEmpty?: boolean;
};

export const TimeStringControl = createControl(
	( { inputDisabled, ariaLabel, error, coerceInvalidToEmpty = false }: TimeStringControlProps ) => {
		const { value, setValue, disabled } = useBoundProp( timeStringPropTypeUtil );

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
					<TimePicker
						value={ parseTimeString( value ?? '' ) }
						onChange={ ( newValue: Dayjs | null ) => handleChange( newValue, TIME_FORMAT ) }
						disabled={ isDisabled }
						slotProps={ slotProps }
					/>
				</ControlActions>
			</LocalizationProvider>
		);
	}
);

import * as React from 'react';
import type { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';
import { stringPropTypeUtil } from '@elementor/editor-props';
import { DatePicker, LocalizationProvider, TimePicker } from '@elementor/ui';

import { useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

type DateStringControlVariant = 'date' | 'time';

type DateStringControlProps = {
	variant?: DateStringControlVariant;
	inputDisabled?: boolean;
	ariaLabel?: string;
	error?: boolean;
};

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';

export const DateStringControl = createControl(
	( { variant = 'date', inputDisabled, ariaLabel, error }: DateStringControlProps ) => {
		const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

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
					{ variant === 'time' ? (
						<TimePicker
							value={ parseTimeString( value ?? '' ) }
							onChange={ ( newValue: Dayjs | null ) => handleChange( newValue, TIME_FORMAT ) }
							disabled={ isDisabled }
							slotProps={ slotProps }
						/>
					) : (
						<DatePicker
							value={ parseDateString( value ?? '' ) }
							onChange={ ( newValue: Dayjs | null ) => handleChange( newValue, DATE_FORMAT ) }
							disabled={ isDisabled }
							slotProps={ slotProps }
						/>
					) }
				</ControlActions>
			</LocalizationProvider>
		);
	}
);

function parseDateString( raw: string ): Dayjs | null {
	if ( ! raw ) {
		return null;
	}

	const parsed = ( dayjs as unknown as { default: ( s?: string | number | Date ) => Dayjs } ).default( raw );

	return isValidDayjs( parsed ) ? parsed : null;
}

function parseTimeString( raw: string ): Dayjs | null {
	if ( ! raw ) {
		return null;
	}

	const [ rawHours, rawMinutes ] = raw.split( ':' );
	const hours = Number.parseInt( rawHours ?? '', 10 );
	const minutes = Number.parseInt( rawMinutes ?? '', 10 );

	if ( Number.isNaN( hours ) || Number.isNaN( minutes ) ) {
		return null;
	}

	const base = ( dayjs as unknown as { default: () => Dayjs } ).default();

	return base.hour( hours ).minute( minutes ).second( 0 ).millisecond( 0 );
}

function isValidDayjs( value: Dayjs | null ): value is Dayjs {
	return !! value && typeof value.isValid === 'function' && value.isValid();
}

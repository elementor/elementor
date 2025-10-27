import * as React from 'react';
import type { Dayjs } from 'dayjs';
import * as dayjs from 'dayjs';
import { isTransformable, type Props, stringPropTypeUtil } from '@elementor/editor-props';
import { DateTimePropTypeUtil } from '@elementor/editor-props';
import { Box, DatePicker, LocalizationProvider, TimePicker } from '@elementor/ui';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

const DATE_FORMAT = 'YYYY-MM-DD';
const TIME_FORMAT = 'HH:mm';

export const DateTimeControl = createControl( ( { inputDisabled }: { inputDisabled?: boolean } ) => {
	const { value, setValue, ...propContext } = useBoundProp( DateTimePropTypeUtil );

	const handleChange = ( newValue: Props, meta: { bind: 'date' | 'time' } ) => {
		const field = meta.bind;
		const fieldValue = newValue[ field as 'date' | 'time' ];

		if ( isTransformable( fieldValue ) ) {
			return setValue( { ...value, [ field ]: fieldValue } );
		}

		let formattedValue = '';

		if ( fieldValue ) {
			const dayjsValue = fieldValue as Dayjs;
			formattedValue = field === 'date' ? dayjsValue.format( DATE_FORMAT ) : dayjsValue.format( TIME_FORMAT );
		}

		setValue( {
			...value,
			[ field ]: {
				$$type: 'string',
				value: formattedValue,
			},
		} );
	};

	const parseDateValue = ( dateStr?: string | null ): Dayjs | null => {
		if ( ! dateStr ) {
			return null;
		}

		const d = ( dayjs as unknown as { default: ( s?: string | number | Date ) => Dayjs } ).default( dateStr );

		return d && typeof d.isValid === 'function' && d.isValid() ? d : null;
	};

	const parseTimeValue = ( timeStr?: string | null ): Dayjs | null => {
		if ( ! timeStr ) {
			return null;
		}

		const [ hours, minutes ] = timeStr.split( ':' );
		const h = Number.parseInt( hours ?? '', 10 );
		const m = Number.parseInt( minutes ?? '', 10 );

		if ( Number.isNaN( h ) || Number.isNaN( m ) ) {
			return null;
		}

		const base = ( dayjs as unknown as { default: () => Dayjs } ).default();
		return base.hour( h ).minute( m ).second( 0 ).millisecond( 0 );
	};

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<ControlActions>
				<LocalizationProvider>
					<Box display="flex" gap={ 1 } alignItems="center">
						<PropKeyProvider bind="date">
							<DatePicker
								value={ parseDateValue( stringPropTypeUtil.extract( value?.date ) ) }
								onChange={ ( v: Dayjs | null ) =>
									handleChange( { date: v } as Props, { bind: 'date' } )
								}
								disabled={ inputDisabled }
								slotProps={ {
									textField: { size: 'tiny' },
									openPickerButton: { size: 'small' },
									openPickerIcon: { fontSize: 'tiny' },
								} }
							/>
						</PropKeyProvider>

						<PropKeyProvider bind="time">
							<TimePicker
								value={ parseTimeValue( stringPropTypeUtil.extract( value?.time ) ) }
								onChange={ ( v: Dayjs | null ) =>
									handleChange( { time: v } as Props, { bind: 'time' } )
								}
								disabled={ inputDisabled }
								slotProps={ {
									textField: { size: 'tiny' },
									openPickerButton: { size: 'small' },
									openPickerIcon: { fontSize: 'tiny' },
								} }
							/>
						</PropKeyProvider>
					</Box>
				</LocalizationProvider>
			</ControlActions>
		</PropProvider>
	);
} );

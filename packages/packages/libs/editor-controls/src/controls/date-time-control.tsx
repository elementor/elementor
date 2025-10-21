import * as React from 'react';
import { isTransformable, type Props, stringPropTypeUtil } from '@elementor/editor-props';
import { DateTimePropTypeUtil } from '@elementor/editor-props';
import { LocalizationProvider } from '@elementor/ui';
import DatePicker from '@elementor/ui/DatePicker';
import TimePicker from '@elementor/ui/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const DateTimeControl = createControl( ( { inputDisabled }: { inputDisabled?: boolean } ) => {
	const { value, setValue, ...propContext } = useBoundProp( DateTimePropTypeUtil );

	const handleChange = ( newValue: Props, meta: { bind: 'date' | 'time' } ) => {
		const field = meta.bind;
		const fieldValue = ( newValue as any )[ field ];

		if ( isTransformable( fieldValue ) ) {
			setValue( { ...value, [ field ]: fieldValue } );
			return;
		}

		setValue( {
			...value,
			[ field ]: {
				$$type: 'string',
				value: stringPropTypeUtil.extract( fieldValue ) || '',
			},
		} );
	};

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<ControlActions>
				<LocalizationProvider dateAdapter={ AdapterDayjs }>
					<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
						<PropKeyProvider bind="date">
							<DatePicker
								value={ stringPropTypeUtil.extract( value?.date ) || null }
								onChange={ ( v: any ) => handleChange( { date: v } as Props, { bind: 'date' } ) }
								disabled={ inputDisabled }
								slotProps={ {
									textField: { size: 'tiny' },
									openPickerButton: { size: 'tiny' },
								} }
							/>
						</PropKeyProvider>

						<PropKeyProvider bind="time">
							<TimePicker
								value={ stringPropTypeUtil.extract( value?.time ) || null }
								onChange={ ( v: any ) => handleChange( { time: v } as Props, { bind: 'time' } ) }
								disabled={ inputDisabled }
								slotProps={ {
									textField: { size: 'tiny' },
									openPickerButton: { size: 'tiny' },
								} }
							/>
						</PropKeyProvider>
					</div>
				</LocalizationProvider>
			</ControlActions>
		</PropProvider>
	);
} );

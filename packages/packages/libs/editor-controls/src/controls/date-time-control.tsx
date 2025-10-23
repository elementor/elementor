import * as React from 'react';
import type { Dayjs } from 'dayjs';
import { isTransformable, type Props, stringPropTypeUtil } from '@elementor/editor-props';
import { DateTimePropTypeUtil } from '@elementor/editor-props';
import { DatePicker, LocalizationProvider, TimePicker } from '@elementor/ui';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const DateTimeControl = createControl( ( { inputDisabled }: { inputDisabled?: boolean } ) => {
	const { value, setValue, ...propContext } = useBoundProp( DateTimePropTypeUtil );

	const handleChange = ( newValue: Props, meta: { bind: 'date' | 'time' } ) => {
		const field = meta.bind;
		const fieldValue = newValue[ field as 'date' | 'time' ];

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
				<LocalizationProvider>
					<div style={ { display: 'flex', gap: '8px', alignItems: 'center' } }>
						<PropKeyProvider bind="date">
							<DatePicker
								value={ stringPropTypeUtil.extract( value?.date ) || null }
								onChange={ ( v: Dayjs | null ) =>
									handleChange( { date: v } as Props, { bind: 'date' } )
								}
								disabled={ inputDisabled }
								slotProps={ {
									textField: { size: 'tiny' },
									openPickerButton: { size: 'small' },
								} }
							/>
						</PropKeyProvider>

						<PropKeyProvider bind="time">
							<TimePicker
								value={ stringPropTypeUtil.extract( value?.time ) || null }
								onChange={ ( v: Dayjs | null ) =>
									handleChange( { time: v } as Props, { bind: 'time' } )
								}
								disabled={ inputDisabled }
								slotProps={ {
									textField: { size: 'tiny' },
									openPickerButton: { size: 'small' },
								} }
							/>
						</PropKeyProvider>
					</div>
				</LocalizationProvider>
			</ControlActions>
		</PropProvider>
	);
} );

import * as React from 'react';
import { LocalizationProvider } from '@elementor/ui';
import DatePicker from '@elementor/ui/DatePicker';
import TimePicker from '@elementor/ui/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import ControlActions from '../control-actions/control-actions';
import { createControl } from '../create-control';

export const DateTimeControl = createControl( ( { inputDisabled }: { inputDisabled?: boolean } ) => {
	const [ valueDate, setValueDate ] = React.useState< Date | null >( null );
	const [ valueTime, setValueTime ] = React.useState< Date | null >( null );

	return (
		<ControlActions>
			<LocalizationProvider dateAdapter={ AdapterDayjs }>
				<DatePicker
					value={ valueDate }
					onChange={ setValueDate }
					disabled={ inputDisabled }
					slotProps={ {
						openPickerButton: { size: 'small' },
						textField: {
							color: 'secondary',
							placeholder: 'MM/DD/YYYY',
						},
					} }
				/>
				<TimePicker
					value={ valueTime }
					onChange={ setValueTime }
					disabled={ inputDisabled }
					slotProps={ {
						openPickerButton: { size: 'small' },
						textField: {
							color: 'secondary',
							placeholder: 'HH:MM',
						},
					} }
				/>
			</LocalizationProvider>
		</ControlActions>
	);
} );

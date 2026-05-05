import * as React from 'react';
import { type PropKey, timeRangePropTypeUtil } from '@elementor/editor-props';
import { Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { TimeStringControl } from './time-string-control';

const RANGE_LABELS = {
	min: __( 'Start time', 'elementor' ),
	max: __( 'End time', 'elementor' ),
};

export const TimeRangeControl = createControl( () => {
	const { value, setValue, ...propContext } = useBoundProp( timeRangePropTypeUtil );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack direction="row" gap={ 2 } flexWrap="nowrap">
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ RANGE_LABELS.min }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<BoundTimeStringControl bind={ 'min' } ariaLabel={ RANGE_LABELS.min } />
					</Grid>
				</Grid>
				<Grid container gap={ 0.75 } alignItems="center">
					<Grid item xs={ 12 }>
						<ControlFormLabel>{ RANGE_LABELS.max }</ControlFormLabel>
					</Grid>
					<Grid item xs={ 12 }>
						<BoundTimeStringControl bind={ 'max' } ariaLabel={ RANGE_LABELS.max } />
					</Grid>
				</Grid>
			</Stack>
		</PropProvider>
	);
} );

const BoundTimeStringControl = ( { bind, ariaLabel }: { bind: PropKey; ariaLabel?: string } ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<TimeStringControl ariaLabel={ ariaLabel } coerceInvalidToNull />
		</PropKeyProvider>
	);
};

import * as React from 'react';
import { dateRangePropTypeUtil, dateStringPropTypeUtil, type PropKey } from '@elementor/editor-props';
import { FormHelperText, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { DateStringControl } from './date-string-control';

const RANGE_LABELS = {
	min: __( 'Min date', 'elementor' ),
	max: __( 'Max date', 'elementor' ),
};

const isMaxBeforeMin = ( minIso?: string | null, maxIso?: string | null ): boolean => {
	if ( ! minIso || ! maxIso || [ minIso, maxIso ].some( ( v ) => v === 'Invalid Date' ) ) {
		return false;
	}

	return maxIso < minIso;
};

const RANGE_ERROR_MESSAGE = __( 'Max date must be on or after Min date', 'elementor' );

export const DateRangeControl = createControl( () => {
	const { value, setValue, ...propContext } = useBoundProp( dateRangePropTypeUtil );

	const minString = dateStringPropTypeUtil.extract( value?.min );
	const maxString = dateStringPropTypeUtil.extract( value?.max );

	const hasInvalidRange = isMaxBeforeMin( minString, maxString );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 0.75 }>
				<Stack direction="row" gap={ 2 } flexWrap="nowrap">
					<Grid container gap={ 0.75 } alignItems="center">
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ RANGE_LABELS.min }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<BoundDateStringControl
								bind={ 'min' }
								ariaLabel={ RANGE_LABELS.min }
								error={ hasInvalidRange }
							/>
						</Grid>
					</Grid>
					<Grid container gap={ 0.75 } alignItems="center">
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ RANGE_LABELS.max }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<BoundDateStringControl
								bind={ 'max' }
								ariaLabel={ RANGE_LABELS.max }
								error={ hasInvalidRange }
							/>
						</Grid>
					</Grid>
				</Stack>
				{ hasInvalidRange && <FormHelperText error>{ RANGE_ERROR_MESSAGE }</FormHelperText> }
			</Stack>
		</PropProvider>
	);
} );

const BoundDateStringControl = ( {
	bind,
	ariaLabel,
	error,
}: {
	bind: PropKey;
	ariaLabel?: string;
	error?: boolean;
} ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<DateStringControl ariaLabel={ ariaLabel } error={ error } coerceInvalidToEmpty />
		</PropKeyProvider>
	);
};

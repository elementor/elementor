import * as React from 'react';
import { minMaxDateTimePropTypeUtil, type PropKey, stringPropTypeUtil } from '@elementor/editor-props';
import { FormHelperText, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../bound-prop-context';
import { ControlFormLabel } from '../components/control-form-label';
import { createControl } from '../create-control';
import { DateStringControl } from './date-string-control';

type MinMaxDateTimeVariant = 'date' | 'time';

type MinMaxDateTimeControlProps = {
	variant?: MinMaxDateTimeVariant;
};

type RangeLabels = {
	min: string;
	max: string;
};

const getLabels = ( variant: MinMaxDateTimeVariant ): RangeLabels => {
	if ( variant === 'time' ) {
		return {
			min: __( 'Start time', 'elementor' ),
			max: __( 'End time', 'elementor' ),
		};
	}

	return {
		min: __( 'Min date', 'elementor' ),
		max: __( 'Max date', 'elementor' ),
	};
};

const isMaxBeforeMin = ( minIso?: string | null, maxIso?: string | null ): boolean => {
	if ( ! minIso || ! maxIso || [ minIso, maxIso ].some( ( v ) => v === 'Invalid Date' ) ) {
		return false;
	}

	return maxIso < minIso;
};

const RANGE_ERROR_MESSAGE = __( 'Max date must be on or after Min date', 'elementor' );

export const MinMaxDateTimeControl = createControl( ( { variant = 'date' }: MinMaxDateTimeControlProps ) => {
	const { value, setValue, ...propContext } = useBoundProp( minMaxDateTimePropTypeUtil );
	const labels = getLabels( variant );

	const minString = stringPropTypeUtil.extract( value?.min );
	const maxString = stringPropTypeUtil.extract( value?.max );

	const hasInvalidRange = variant === 'date' && isMaxBeforeMin( minString, maxString );

	return (
		<PropProvider { ...propContext } value={ value } setValue={ setValue }>
			<Stack gap={ 0.75 }>
				<Stack direction="row" gap={ 2 } flexWrap="nowrap">
					<Grid container gap={ 0.75 } alignItems="center">
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ labels.min }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<BoundDateStringControl
								bind={ 'min' }
								variant={ variant }
								ariaLabel={ labels.min }
								error={ hasInvalidRange }
							/>
						</Grid>
					</Grid>
					<Grid container gap={ 0.75 } alignItems="center">
						<Grid item xs={ 12 }>
							<ControlFormLabel>{ labels.max }</ControlFormLabel>
						</Grid>
						<Grid item xs={ 12 }>
							<BoundDateStringControl
								bind={ 'max' }
								variant={ variant }
								ariaLabel={ labels.max }
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
	variant,
	ariaLabel,
	error,
}: {
	bind: PropKey;
	variant: MinMaxDateTimeVariant;
	ariaLabel?: string;
	error?: boolean;
} ) => {
	return (
		<PropKeyProvider bind={ bind }>
			<DateStringControl variant={ variant } ariaLabel={ ariaLabel } error={ error } />
		</PropKeyProvider>
	);
};

import * as React from 'react';
import { transformOriginPropTypeUtil } from '@elementor/editor-props';
import { Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { ControlFormLabel } from '../../../components/control-form-label';
import { ControlLabel } from '../../../components/control-label';
import { type LengthUnit } from '../../../utils/size-control';
import { SizeControl } from '../../size-control';

const TRANSFORM_ORIGIN_UNITS: LengthUnit[] = [ 'px', '%', 'em', 'rem' ];
const TRANSFORM_ORIGIN_UNITS_Z_AXIS = TRANSFORM_ORIGIN_UNITS.filter( ( unit ) => unit !== '%' );

const TRANSFORM_ORIGIN_FIELDS = [
	{
		label: __( 'Origin X', 'elementor' ),
		bind: 'x',
		units: TRANSFORM_ORIGIN_UNITS,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bind: 'y',
		units: TRANSFORM_ORIGIN_UNITS,
	},
	{
		label: __( 'Origin Z', 'elementor' ),
		bind: 'z',
		units: TRANSFORM_ORIGIN_UNITS_Z_AXIS,
	},
];

export const TransformOriginControl = () => {
	return (
		<Stack direction="column" spacing={ 1.5 }>
			<ControlFormLabel sx={ { pt: 1.5, pl: 1.5 } }>{ __( 'Transform', 'elementor' ) }</ControlFormLabel>
			<Grid container spacing={ 1.5 }>
				{ TRANSFORM_ORIGIN_FIELDS.map( ( control ) => (
					<ControlFields control={ control } key={ control.bind } />
				) ) }
				<Divider sx={ { py: 3 } } />
			</Grid>
		</Stack>
	);
};

const ControlFields = ( { control }: { control: ( typeof TRANSFORM_ORIGIN_FIELDS )[ number ] } ) => {
	const context = useBoundProp( transformOriginPropTypeUtil );
	const rowRef = React.useRef< HTMLDivElement >( null );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind={ control.bind }>
				<Grid item xs={ 12 } ref={ rowRef }>
					<Grid container spacing={ 1 } alignItems="center">
						<Grid item xs={ 6 }>
							<ControlLabel>{ control.label }</ControlLabel>
						</Grid>
						<Grid item xs={ 6 } sx={ { pr: 3 } }>
							<SizeControl variant="length" units={ control.units } anchorRef={ rowRef } disableCustom />
						</Grid>
					</Grid>
				</Grid>
			</PropKeyProvider>
		</PropProvider>
	);
};

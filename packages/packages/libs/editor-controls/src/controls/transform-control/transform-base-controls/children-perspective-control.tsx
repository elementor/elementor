import * as React from 'react';
import { sizePropTypeUtil } from '@elementor/editor-props';
import { Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { ControlFormLabel } from '../../../components/control-form-label';
import { ControlLabel } from '../../../components/control-label';
import { lengthUnits } from '../../../utils/size-control';
import { SizeControl } from '../../size-control';

const ORIGIN_UNITS = [ 'px', '%', 'em', 'rem' ] as const;

const CHILDREN_PERSPECTIVE_FIELDS = [
	{
		label: __( 'Perspective', 'elementor' ),
		bind: 'perspective',
		units: lengthUnits,
	},
	{
		label: __( 'Origin X', 'elementor' ),
		bind: 'perspective-origin-x',
		units: ORIGIN_UNITS,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bind: 'perspective-origin-y',
		units: ORIGIN_UNITS,
	},
] as const;

export const ChildrenPerspectiveControl = () => {
	return (
		<Stack direction="column" spacing={ 1.5 }>
			<ControlFormLabel sx={ { pt: 1.5, pl: 1.5 } }>
				{ __( 'Children perspective', 'elementor' ) }
			</ControlFormLabel>
			<Grid container spacing={ 1.5 }>
				{ CHILDREN_PERSPECTIVE_FIELDS.map( ( control ) => (
					<ControlFields control={ control } key={ control.bind } />
				) ) }
				<Divider sx={ { py: 3 } } />
			</Grid>
		</Stack>
	);
};

const ControlFields = ( { control }: { control: ( typeof CHILDREN_PERSPECTIVE_FIELDS )[ number ] } ) => {
	const context = useBoundProp( sizePropTypeUtil );
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
							<SizeControl
								variant="length"
								units={ [ ...control.units ] }
								anchorRef={ rowRef }
								disableCustom
							/>
						</Grid>
					</Grid>
				</Grid>
			</PropKeyProvider>
		</PropProvider>
	);
};

import * as React from 'react';
import { sizePropTypeUtil } from '@elementor/editor-props';
import { Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { ControlFormLabel } from '../../../components/control-form-label';
import { ControlLabel } from '../../../components/control-label';
import { lengthUnits } from '../../../utils/size-control';
import { SizeControl } from '../../size-control';

const ORIGIN_UNITS = [ 'px', '%', 'em', 'rem' ] as ( 'px' | '%' | 'em' | 'rem' )[];

const CHILDREN_PERSPECTIVE_FIELDS = [
	{
		label: __( 'Perspective', 'elementor' ),
		bindValue: 'perspective',
		units: lengthUnits,
	},
	{
		label: __( 'Origin X', 'elementor' ),
		bindValue: 'perspective-origin-x',
		units: ORIGIN_UNITS,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bindValue: 'perspective-origin-y',
		units: ORIGIN_UNITS,
	},
] as const;

export const ChildrenPerspectiveControl = ( { rowRef }: { rowRef: React.RefObject< HTMLDivElement > } ) => {
	return (
		<Stack direction="column" spacing={ 1.5 }>
			<ControlFormLabel sx={ { pt: 1.5, pl: 1.5 } }>
				{ __( 'Children perspective', 'elementor' ) }
			</ControlFormLabel>
			<Grid container spacing={ 1.5 } ref={ rowRef }>
				{ CHILDREN_PERSPECTIVE_FIELDS.map( ( control ) => (
					<ControlFields control={ control } rowRef={ rowRef } key={ control.bindValue } />
				) ) }
				<Divider sx={ { py: 3 } } />
			</Grid>
		</Stack>
	);
};

const ControlFields = ( {
	control,
	rowRef,
}: {
	control: ( typeof CHILDREN_PERSPECTIVE_FIELDS )[ number ];
	rowRef: React.RefObject< HTMLDivElement >;
} ) => {
	const context = useBoundProp( sizePropTypeUtil );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind={ control.bindValue }>
				<Grid item xs={ 12 }>
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

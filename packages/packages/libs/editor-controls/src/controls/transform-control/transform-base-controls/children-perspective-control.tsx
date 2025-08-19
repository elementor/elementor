import * as React from 'react';
import { perspectiveOriginPropTypeUtil, sizePropTypeUtil } from '@elementor/editor-props';
import { Divider, Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { ControlFormLabel } from '../../../components/control-form-label';
import { ControlLabel } from '../../../components/control-label';
import { type LengthUnit, lengthUnits } from '../../../utils/size-control';
import { SizeControl } from '../../size-control';

type FieldProps = {
	label: string;
	bind: string;
	units: LengthUnit[];
};

const ORIGIN_UNITS: LengthUnit[] = [ 'px', '%', 'em', 'rem' ];

const PERSPECTIVE_CONTROL_FIELD: FieldProps = {
	label: __( 'Perspective', 'elementor' ),
	bind: 'perspective',
	units: [ ...lengthUnits ],
};

const CHILDREN_PERSPECTIVE_FIELDS: FieldProps[] = [
	{
		label: __( 'Origin X', 'elementor' ),
		bind: 'x',
		units: ORIGIN_UNITS,
	},
	{
		label: __( 'Origin Y', 'elementor' ),
		bind: 'y',
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
				<PerspectiveControl />
				<PerspectiveOriginControl />
				<Divider sx={ { py: 3 } } />
			</Grid>
		</Stack>
	);
};

const PerspectiveControl = () => (
	<PropKeyProvider bind={ 'perspective' }>
		<ControlFields control={ PERSPECTIVE_CONTROL_FIELD } key={ PERSPECTIVE_CONTROL_FIELD.bind } />
	</PropKeyProvider>
);

const PerspectiveOriginControl = () => (
	<PropKeyProvider bind={ 'perspective-origin' }>
		<PerspectiveOriginControlProvider />
	</PropKeyProvider>
);

const PerspectiveOriginControlProvider = () => {
	const context = useBoundProp( perspectiveOriginPropTypeUtil );

	return (
		<PropProvider { ...context }>
			{ CHILDREN_PERSPECTIVE_FIELDS.map( ( control ) => (
				<PropKeyProvider bind={ control.bind } key={ control.bind }>
					<SizeContextProvider>
						<ControlFields control={ control } />
					</SizeContextProvider>
				</PropKeyProvider>
			) ) }
		</PropProvider>
	);
};

const SizeContextProvider = ( { children }: { children: React.ReactNode } ) => {
	const context = useBoundProp( sizePropTypeUtil );

	return <PropProvider { ...context }>{ children }</PropProvider>;
};

const ControlFields = ( { control }: { control: FieldProps } ) => {
	const rowRef = React.useRef< HTMLDivElement >( null );

	return (
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
	);
};

import * as React from 'react';
import { perspectiveOriginPropTypeUtil } from '@elementor/editor-props';
import { Grid, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { ControlFormLabel } from '../../../components/control-form-label';
import { PopoverGridContainer } from '../../../components/popover-grid-container';
import { type LengthUnit } from '../../../utils/size-control';
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
	units: [ 'px', 'em', 'rem', 'vw', 'vh' ],
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
			<ControlFormLabel>{ __( 'Children perspective', 'elementor' ) }</ControlFormLabel>
			<PerspectiveControl />
			<PerspectiveOriginControl />
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
					<ControlFields control={ control } />
				</PropKeyProvider>
			) ) }
		</PropProvider>
	);
};

const ControlFields = ( { control }: { control: FieldProps } ) => {
	const rowRef = React.useRef< HTMLDivElement >( null );

	return (
		<PopoverGridContainer ref={ rowRef }>
			<Grid item xs={ 6 }>
				<ControlFormLabel>{ control.label }</ControlFormLabel>
			</Grid>
			<Grid item xs={ 6 }>
				<SizeControl variant="length" units={ control.units } anchorRef={ rowRef } disableCustom />
			</Grid>
		</PopoverGridContainer>
	);
};

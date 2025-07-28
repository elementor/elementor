import * as React from 'react';
import { useRef } from 'react';
import { rotateTransformPropTypeUtil } from '@elementor/editor-props';
import { Arrow360Icon, RotateClockwiseIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { type AngleUnit } from '../../../utils/size-control';
import { TransformFunctionKeys } from '../types';
import { AxisRow } from './axis-row';

const rotateAxisControls: { label: string; bindValue: 'x' | 'y' | 'z'; startIcon: React.ReactNode }[] = [
	{
		label: __( 'Rotate X', 'elementor' ),
		bindValue: 'x',
		startIcon: <Arrow360Icon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Rotate Y', 'elementor' ),
		bindValue: 'y',
		startIcon: <Arrow360Icon fontSize="tiny" style={ { transform: 'scaleX(-1) rotate(-90deg)' } } />,
	},
	{
		label: __( 'Rotate Z', 'elementor' ),
		bindValue: 'z',
		startIcon: <RotateClockwiseIcon fontSize={ 'tiny' } />,
	},
];

const rotateUnits: AngleUnit[] = [ 'deg', 'rad', 'grad', 'turn' ];

export const Rotate = () => {
	const context = useBoundProp( rotateTransformPropTypeUtil );
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<Grid container spacing={ 1.5 }>
			<PropProvider { ...context }>
				<PropKeyProvider bind={ TransformFunctionKeys.rotate }>
					{ rotateAxisControls.map( ( control ) => (
						<AxisRow key={ control.bindValue } { ...control } anchorRef={ rowRef } units={ rotateUnits } />
					) ) }
				</PropKeyProvider>
			</PropProvider>
		</Grid>
	);
};

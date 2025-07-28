import * as React from 'react';
import { useRef } from 'react';
import { skewTransformPropTypeUtil } from '@elementor/editor-props';
import { ArrowLeftIcon, ArrowRightIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { type AngleUnit } from '../../../utils/size-control';
import { TransformFunctionKeys } from '../types';
import { AxisRow } from './axis-row';

const skewAxisControls: { label: string; bindValue: 'x' | 'y'; startIcon: React.ReactNode }[] = [
	{
		label: __( 'Skew X', 'elementor' ),
		bindValue: 'x',
		startIcon: <ArrowRightIcon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Skew Y', 'elementor' ),
		bindValue: 'y',
		startIcon: <ArrowLeftIcon fontSize="tiny" style={ { transform: 'scaleX(-1) rotate(-90deg)' } } />,
	},
];

const skewUnits: AngleUnit[] = [ 'deg', 'rad', 'grad', 'turn' ];

export const Skew = () => {
	const context = useBoundProp( skewTransformPropTypeUtil );
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<Grid container spacing={ 1.5 }>
			<PropProvider { ...context }>
				<PropKeyProvider bind={ TransformFunctionKeys.skew }>
					{ skewAxisControls.map( ( control ) => (
						<AxisRow key={ control.bindValue } { ...control } anchorRef={ rowRef } units={ skewUnits } />
					) ) }
				</PropKeyProvider>
			</PropProvider>
		</Grid>
	);
};

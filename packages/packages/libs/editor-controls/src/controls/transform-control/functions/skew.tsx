import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { skewTransformPropTypeUtil } from '@elementor/editor-props';
import { ArrowLeftIcon, ArrowRightIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { type AngleUnit } from '../../../utils/size-control';
import { TransformFunctionKeys } from '../initial-values';
import { AxisRow } from './axis-row';

const skewAxisControls: { label: string; bind: 'x' | 'y'; startIcon: React.ReactNode }[] = [
	{
		label: __( 'Skew X', 'elementor' ),
		bind: 'x',
		startIcon: <ArrowRightIcon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Skew Y', 'elementor' ),
		bind: 'y',
		startIcon: <ArrowLeftIcon fontSize="tiny" style={ { transform: 'scaleX(-1) rotate(-90deg)' } } />,
	},
];

const skewUnits: AngleUnit[] = [ 'deg', 'rad', 'grad', 'turn' ];

export const Skew = () => {
	const context = useBoundProp( skewTransformPropTypeUtil );
	const rowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ), useRef( null ) ];

	return (
		<Grid container spacing={ 1.5 }>
			<PropProvider { ...context }>
				<PropKeyProvider bind={ TransformFunctionKeys.skew }>
					{ skewAxisControls.map( ( control, index ) => (
						<AxisRow
							key={ control.bind }
							{ ...control }
							anchorRef={ rowRefs[ index ] }
							units={ skewUnits }
						/>
					) ) }
				</PropKeyProvider>
			</PropProvider>
		</Grid>
	);
};

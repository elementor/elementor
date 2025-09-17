import * as React from 'react';
import { type RefObject, useRef } from 'react';
import { moveTransformPropTypeUtil } from '@elementor/editor-props';
import { ArrowDownLeftIcon, ArrowDownSmallIcon, ArrowRightIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { type LengthUnit } from '../../../utils/size-control';
import { TransformFunctionKeys } from '../initial-values';
import { AxisRow } from './axis-row';

type Control = { label: string; bind: 'x' | 'y' | 'z'; startIcon: React.ReactNode; units: LengthUnit[] };

const moveAxisControls: Control[] = [
	{
		label: __( 'Move X', 'elementor' ),
		bind: 'x',
		startIcon: <ArrowRightIcon fontSize={ 'tiny' } />,
		units: [ 'px', '%', 'em', 'rem', 'vw' ],
	},
	{
		label: __( 'Move Y', 'elementor' ),
		bind: 'y',
		startIcon: <ArrowDownSmallIcon fontSize={ 'tiny' } />,
		units: [ 'px', '%', 'em', 'rem', 'vh' ],
	},
	{
		label: __( 'Move Z', 'elementor' ),
		bind: 'z',
		startIcon: <ArrowDownLeftIcon fontSize={ 'tiny' } />,
		units: [ 'px', '%', 'em', 'rem', 'vw', 'vh' ],
	},
];

export const Move = () => {
	const context = useBoundProp( moveTransformPropTypeUtil );
	const rowRefs: RefObject< HTMLDivElement >[] = [ useRef( null ), useRef( null ), useRef( null ) ];

	return (
		<Grid container spacing={ 1.5 }>
			<PropProvider { ...context }>
				<PropKeyProvider bind={ TransformFunctionKeys.move }>
					{ moveAxisControls.map( ( control, index ) => (
						<AxisRow
							key={ control.bind }
							{ ...control }
							anchorRef={ rowRefs[ index ] }
							units={ control.units }
							variant="length"
						/>
					) ) }
				</PropKeyProvider>
			</PropProvider>
		</Grid>
	);
};

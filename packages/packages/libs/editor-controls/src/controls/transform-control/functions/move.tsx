import * as React from 'react';
import { useRef } from 'react';
import { moveTransformPropTypeUtil } from '@elementor/editor-props';
import { ArrowDownLeftIcon, ArrowDownSmallIcon, ArrowRightIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { TransformFunctionKeys } from '../types';
import { AxisRow } from './axis-row';

const moveAxisControls: { label: string; bindValue: 'x' | 'y' | 'z'; startIcon: React.ReactNode }[] = [
	{
		label: __( 'Move X', 'elementor' ),
		bindValue: 'x',
		startIcon: <ArrowRightIcon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Move Y', 'elementor' ),
		bindValue: 'y',
		startIcon: <ArrowDownSmallIcon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Move Z', 'elementor' ),
		bindValue: 'z',
		startIcon: <ArrowDownLeftIcon fontSize={ 'tiny' } />,
	},
];

export const Move = () => {
	const context = useBoundProp( moveTransformPropTypeUtil );
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<Grid container spacing={ 1.5 }>
			<PropProvider { ...context }>
				<PropKeyProvider bind={ TransformFunctionKeys.move }>
					{ moveAxisControls.map( ( control ) => (
						<AxisRow key={ control.bindValue } { ...control } anchorRef={ rowRef } />
					) ) }
				</PropKeyProvider>
			</PropProvider>
		</Grid>
	);
};

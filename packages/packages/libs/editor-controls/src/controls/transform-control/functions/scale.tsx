import * as React from 'react';
import { useRef } from 'react';
import { scaleTransformPropTypeUtil } from '@elementor/editor-props';
import { ArrowDownLeftIcon, ArrowDownSmallIcon, ArrowRightIcon } from '@elementor/icons';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../../bound-prop-context';
import { TransformFunctionKeys } from '../types';
import { ScaleAxisRow } from './scale-axis-row';

const scaleAxisControls: { label: string; bindValue: 'x' | 'y' | 'z'; startIcon: React.ReactNode }[] = [
	{
		label: __( 'Scale X', 'elementor' ),
		bindValue: 'x',
		startIcon: <ArrowRightIcon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Scale Y', 'elementor' ),
		bindValue: 'y',
		startIcon: <ArrowDownSmallIcon fontSize={ 'tiny' } />,
	},
	{
		label: __( 'Scale Z', 'elementor' ),
		bindValue: 'z',
		startIcon: <ArrowDownLeftIcon fontSize={ 'tiny' } />,
	},
];

export const Scale = () => {
	const context = useBoundProp( scaleTransformPropTypeUtil );
	const rowRef = useRef< HTMLDivElement >( null );

	return (
		<Grid container spacing={ 1.5 }>
			<PropProvider { ...context }>
				<PropKeyProvider bind={ TransformFunctionKeys.scale }>
					{ scaleAxisControls.map( ( control ) => (
						<ScaleAxisRow key={ control.bindValue } { ...control } anchorRef={ rowRef } />
					) ) }
				</PropKeyProvider>
			</PropProvider>
		</Grid>
	);
};

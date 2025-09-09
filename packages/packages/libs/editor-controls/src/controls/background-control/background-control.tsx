import * as React from 'react';
import { backgroundPropTypeUtil } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlLabel } from '../../components/control-label';
import { createControl } from '../../create-control';
import { ColorControl } from '../color-control';
import { SelectControl } from '../select-control';
import { BackgroundOverlayRepeaterControl } from './background-overlay/background-overlay-repeater-control';

const clipOptions = [
	{ label: __( 'Border edges', 'elementor' ), value: 'border-box' },
	{ label: __( 'Padding edges', 'elementor' ), value: 'padding-box' },
	{ label: __( 'Content edges', 'elementor' ), value: 'content-box' },
	{ label: __( 'Text', 'elementor' ), value: 'text' },
];

const colorLabel = __( 'Color', 'elementor' );
const clipLabel = __( 'Clipping', 'elementor' );

export const BackgroundControl = createControl( () => {
	const propContext = useBoundProp( backgroundPropTypeUtil );

	return (
		<PropProvider { ...propContext }>
			<PropKeyProvider bind="background-overlay">
				<BackgroundOverlayRepeaterControl />
			</PropKeyProvider>
			<BackgroundColorField />
			<BackgroundClipField />
		</PropProvider>
	);
} );

const BackgroundColorField = () => {
	return (
		<PropKeyProvider bind="color">
			<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
				<Grid item xs={ 6 }>
					<ControlLabel>{ colorLabel }</ControlLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<ColorControl />
				</Grid>
			</Grid>
		</PropKeyProvider>
	);
};

const BackgroundClipField = () => {
	return (
		<PropKeyProvider bind="clip">
			<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
				<Grid item xs={ 6 }>
					<ControlLabel>{ clipLabel }</ControlLabel>
				</Grid>
				<Grid item xs={ 6 }>
					<SelectControl options={ clipOptions } />
				</Grid>
			</Grid>
		</PropKeyProvider>
	);
};

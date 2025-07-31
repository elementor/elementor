import * as React from 'react';
import { backgroundPropTypeUtil } from '@elementor/editor-props';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlLabel } from '../../components/control-label';
import { createControl } from '../../create-control';
import { ColorControl } from '../color-control';
import { BackgroundOverlayRepeaterControl } from './background-overlay/background-overlay-repeater-control';

export const BackgroundControl = createControl( () => {
	const propContext = useBoundProp( backgroundPropTypeUtil );

	const colorLabel = __( 'Color', 'elementor' );

	return (
		<PropProvider { ...propContext }>
			<PropKeyProvider bind="background-overlay">
				<BackgroundOverlayRepeaterControl />
			</PropKeyProvider>
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
		</PropProvider>
	);
} );

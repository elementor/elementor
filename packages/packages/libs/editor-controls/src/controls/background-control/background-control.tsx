import * as React from 'react';
import { backgroundPropTypeUtil } from '@elementor/editor-props';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { Grid } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { PropKeyProvider, PropProvider, useBoundProp } from '../../bound-prop-context';
import { ControlFormLabel } from '../../components/control-form-label';
import { ControlLabel } from '../../components/control-label';
import { createControl } from '../../create-control';
import { ColorControl } from '../color-control';
import { BackgroundOverlayRepeaterControl } from './background-overlay/background-overlay-repeater-control';

export const BackgroundControl = createControl( () => {
	const propContext = useBoundProp( backgroundPropTypeUtil );
	const isUsingNestedProps = isExperimentActive( 'e_v_3_30' );

	const colorLabel = __( 'Color', 'elementor' );

	return (
		<PropProvider { ...propContext }>
			<PropKeyProvider bind="background-overlay">
				<BackgroundOverlayRepeaterControl />
			</PropKeyProvider>
			<PropKeyProvider bind="color">
				<Grid container gap={ 2 } alignItems="center" flexWrap="nowrap">
					<Grid item xs={ 6 }>
						{ isUsingNestedProps ? (
							<ControlLabel>{ colorLabel }</ControlLabel>
						) : (
							<ControlFormLabel>{ colorLabel }</ControlFormLabel>
						) }
					</Grid>
					<Grid item xs={ 6 }>
						<ColorControl />
					</Grid>
				</Grid>
			</PropKeyProvider>
		</PropProvider>
	);
} );

import * as React from 'react';
import { PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { timingConfigPropTypeUtil } from '../prop-types/timing-config';
import { ControlField } from './control-field';
import { Size } from './controls/size';

export const TimingConfig = () => {
	const context = useBoundProp( timingConfigPropTypeUtil );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind="duration">
				<ControlField label={ __( 'Duration', 'elementor' ) }>
					<Size />
				</ControlField>
			</PropKeyProvider>
			<PropKeyProvider bind="delay">
				<ControlField label={ __( 'Delay', 'elementor' ) }>
					<Size />
				</ControlField>
			</PropKeyProvider>
		</PropProvider>
	);
};

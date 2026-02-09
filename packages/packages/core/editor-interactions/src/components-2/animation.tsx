import * as React from 'react';
import { PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { animationPropTypeUtil } from '../prop-types/animation';
import { ControlField } from './control-field';
import { Select } from './controls/select';
import { TimingConfig } from './timing-config';
import { EffectType } from './ui/effect-type';

export const Animation = () => {
	const context = useBoundProp( animationPropTypeUtil );

	return (
		<PropProvider { ...context }>
			<PropKeyProvider bind="effect">
				<ControlField label={ __( 'Effect', 'elementor' ) }>
					<Select />
				</ControlField>
			</PropKeyProvider>

			<PropKeyProvider bind="effect-type">
				<ControlField label={ __( 'Type', 'elementor' ) }>
					<EffectType />
				</ControlField>
			</PropKeyProvider>

			<PropKeyProvider bind="timing-config">
				<TimingConfig />
			</PropKeyProvider>
		</PropProvider>
	);
};

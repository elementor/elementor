import * as React from 'react';
import { PropKeyProvider, PropProvider, useBoundProp } from '@elementor/editor-controls';
import { Divider } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { AnimationSlot, TriggerSlot } from '../locations';
import { interactionItemPropTypeUtil } from '../prop-types/interaction-item';
import { Animation } from './animation';
import { ControlField } from './control-field';
import { Select } from './controls/select';
import { Section } from './section';

export const Content = () => {
	const propContext = useBoundProp( interactionItemPropTypeUtil );

	return (
		<PropProvider { ...propContext }>
			<Section id="trigger">
				<PropKeyProvider bind="trigger">
					<ControlField label={ __( 'Trigger', 'elementor' ) }>
						<Select />
					</ControlField>
				</PropKeyProvider>

				<TriggerSlot />
			</Section>

			<Divider />

			<Section id="animation">
				<PropKeyProvider bind="animation">
					<Animation />
				</PropKeyProvider>
				<AnimationSlot />
			</Section>
		</PropProvider>
	);
};

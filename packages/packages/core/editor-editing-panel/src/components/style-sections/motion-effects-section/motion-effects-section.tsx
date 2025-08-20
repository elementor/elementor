import * as React from 'react';
import {
	EntranceAnimationControl,
	TransitionRepeaterControl,
} from '@elementor/editor-controls';
import { EXPERIMENTAL_FEATURES, isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';

const ENTRANCE_ANIMATION_LABEL = __( 'Entrance Animation', 'elementor' );
const TRANSITIONS_LABEL = __( 'Transitions', 'elementor' );

export const MotionEffectsSection = () => {
	// const shouldShowTransition = isExperimentActive( EXPERIMENTAL_FEATURES.TRANSITIONS );

	return (
		<SectionContent>
			<StylesField bind="entrance-animation" propDisplayName={ ENTRANCE_ANIMATION_LABEL }>
				<EntranceAnimationControl />
			</StylesField>
			{/* { shouldShowTransition && (
				<>
					<PanelDivider />
					<StylesField bind="transition" propDisplayName={ TRANSITIONS_LABEL }>
						<TransitionRepeaterControl />
					</StylesField>
				</>
			) } */}
		</SectionContent>
	);
}; 
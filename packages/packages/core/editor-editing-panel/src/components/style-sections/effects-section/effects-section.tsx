import * as React from 'react';
import { BoxShadowRepeaterControl, FilterRepeaterControl, TransitionRepeaterControl } from '@elementor/editor-controls';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { OpacityControlField } from './opacity-control-field';

const BOX_SHADOW_LABEL = __( 'Box shadow', 'elementor' );
const FILTER_LABEL = __( 'Filters', 'elementor' );
const BACKDROP_FILTER_LABEL = __( 'Backdrop filters', 'elementor' );
const TRANSITIONS_LABEL = __( 'Transitions', 'elementor' );

export const EffectsSection = () => {
	const shouldShowTransition = isExperimentActive( 'atomic_widgets_should_use_transition' );

	return (
		<SectionContent>
			<OpacityControlField />
			<PanelDivider />
			<StylesField bind="box-shadow" propDisplayName={ BOX_SHADOW_LABEL }>
				<BoxShadowRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="filter" propDisplayName={ FILTER_LABEL }>
				<FilterRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="backdrop-filter" propDisplayName={ BACKDROP_FILTER_LABEL }>
				<FilterRepeaterControl filterPropName="backdrop-filter" />
			</StylesField>
			<PanelDivider />
			{ shouldShowTransition && (
				<StylesField bind="transition" propDisplayName={ TRANSITIONS_LABEL }>
					<TransitionRepeaterControl />
				</StylesField>
			) }
		</SectionContent>
	);
};

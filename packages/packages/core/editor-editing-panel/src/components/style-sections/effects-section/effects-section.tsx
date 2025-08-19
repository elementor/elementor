import * as React from 'react';
import {
	BoxShadowRepeaterControl,
	FilterRepeaterControl,
	TransformRepeaterControl,
	TransitionRepeaterControl,
} from '@elementor/editor-controls';
import { useSelectedElement } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { useStyle } from '../../../contexts/style-context';
import { StylesField } from '../../../controls-registry/styles-field';
import { getRecentlyUsedList } from '../../../utils/get-recently-used-styles';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { OpacityControlField } from './opacity-control-field';

const BOX_SHADOW_LABEL = __( 'Box shadow', 'elementor' );
const FILTER_LABEL = __( 'Filters', 'elementor' );
const TRANSFORM_LABEL = __( 'Transform', 'elementor' );
const BACKDROP_FILTER_LABEL = __( 'Backdrop filters', 'elementor' );
const TRANSITIONS_LABEL = __( 'Transitions', 'elementor' );

export const EffectsSection = () => {
	const { element } = useSelectedElement();
	const { meta } = useStyle();

	return (
		<SectionContent>
			<OpacityControlField />
			<PanelDivider />
			<StylesField bind="box-shadow" propDisplayName={ BOX_SHADOW_LABEL }>
				<BoxShadowRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="transform" propDisplayName={ TRANSFORM_LABEL }>
				<TransformRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="transition" propDisplayName={ TRANSITIONS_LABEL }>
				<TransitionRepeaterControl
					currentStyleState={ meta.state }
					recentlyUsedList={ getRecentlyUsedList( element?.id ) }
				/>
			</StylesField>
			<PanelDivider />
			<StylesField bind="filter" propDisplayName={ FILTER_LABEL }>
				<FilterRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="backdrop-filter" propDisplayName={ BACKDROP_FILTER_LABEL }>
				<FilterRepeaterControl filterPropName="backdrop-filter" />
			</StylesField>
		</SectionContent>
	);
};

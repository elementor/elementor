import * as React from 'react';
import {
	BoxShadowRepeaterControl,
	FilterRepeaterControl,
	TransformRepeaterControl,
	TransitionRepeaterControl,
	useElementCanHaveChildren,
} from '@elementor/editor-controls';
import { __ } from '@wordpress/i18n';

import { useElement } from '../../../contexts/element-context';
import { useStyle } from '../../../contexts/style-context';
import { StylesField } from '../../../controls-registry/styles-field';
import { getRecentlyUsedList } from '../../../utils/get-recently-used-styles';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { BlendModeField } from './blend-mode-field';
import { OpacityControlField } from './opacity-control-field';

const BOX_SHADOW_LABEL = __( 'Box shadow', 'elementor' );
const FILTER_LABEL = __( 'Filters', 'elementor' );
const TRANSFORM_LABEL = __( 'Transform', 'elementor' );
const BACKDROP_FILTER_LABEL = __( 'Backdrop filters', 'elementor' );
const TRANSITIONS_LABEL = __( 'Transitions', 'elementor' );

export const EffectsSection = () => {
	const { element } = useElement();
	const { meta } = useStyle();

	const canElementHaveChildren = useElementCanHaveChildren( element?.id ?? '' );

	return (
		<SectionContent gap={ 1 }>
			<BlendModeField />
			<PanelDivider />
			<OpacityControlField />
			<PanelDivider />
			<StylesField bind="box-shadow" propDisplayName={ BOX_SHADOW_LABEL }>
				<BoxShadowRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="transform" propDisplayName={ TRANSFORM_LABEL }>
				<TransformRepeaterControl showChildrenPerspective={ canElementHaveChildren } />
			</StylesField>
			<PanelDivider />
			<StylesField bind="transition" propDisplayName={ TRANSITIONS_LABEL }>
				<TransitionRepeaterControl
					currentStyleState={ meta.state }
					recentlyUsedListGetter={ () => getRecentlyUsedList( element?.id ?? '' ) }
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

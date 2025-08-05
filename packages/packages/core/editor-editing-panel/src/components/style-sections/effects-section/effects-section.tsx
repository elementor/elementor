import * as React from 'react';
import { useRef } from 'react';
import {
	BoxShadowRepeaterControl,
	FilterRepeaterControl,
	injectIntoRepeaterHeaderActions,
	TransformBaseControl,
	TransitionRepeaterControl,
	UnstableTransformRepeaterControl,
	useBoundProp,
} from '@elementor/editor-controls';
import { EXPERIMENTAL_FEATURES, isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { StylesField } from '../../../controls-registry/styles-field';
import { PanelDivider } from '../../panel-divider';
import { SectionContent } from '../../section-content';
import { OpacityControlField } from './opacity-control-field';

const BOX_SHADOW_LABEL = __( 'Box shadow', 'elementor' );
const FILTER_LABEL = __( 'Filters', 'elementor' );
const TRANSFORM_LABEL = __( 'Transform', 'elementor' );
const BACKDROP_FILTER_LABEL = __( 'Backdrop filters', 'elementor' );
const TRANSITIONS_LABEL = __( 'Transitions', 'elementor' );
const TRANSFORM_ORIGIN_LABEL = __( 'Transform origin', 'elementor' );

export const EffectsSection = () => {
	const shouldShowTransition = isExperimentActive( EXPERIMENTAL_FEATURES.TRANSITIONS );
	const contentRef = useRef< HTMLDivElement >( null );

	injectIntoRepeaterHeaderActions( {
		id: 'transform-origin',
		component: () => <TransformOriginControl ref={ contentRef } />,
	} );

	return (
		<SectionContent>
			<OpacityControlField />
			<PanelDivider />
			<StylesField bind="box-shadow" propDisplayName={ BOX_SHADOW_LABEL }>
				<BoxShadowRepeaterControl />
			</StylesField>
			<PanelDivider />
			<StylesField bind="transform" propDisplayName={ TRANSFORM_LABEL }>
				<UnstableTransformRepeaterControl />
			</StylesField>
			{ shouldShowTransition && (
				<>
					<PanelDivider />
					<StylesField bind="transition" propDisplayName={ TRANSITIONS_LABEL }>
						<TransitionRepeaterControl />
					</StylesField>
				</>
			) }
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

const TransformOriginControl = ( { ref }: { ref: React.RefObject< HTMLDivElement > } ) => {
	console.log(ref);
	const { bind } = useBoundProp();
	if ( bind !== 'transform' ) {
		return null;
	}
	return (
		<StylesField bind={ 'transform-origin' } propDisplayName={ TRANSFORM_ORIGIN_LABEL }>
			<TransformBaseControl ref={ ref } />
		</StylesField>
	);
};

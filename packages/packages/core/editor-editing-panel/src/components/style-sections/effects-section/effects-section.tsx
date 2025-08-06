import * as React from 'react';
import { useRef } from 'react';
import {
	BoxShadowRepeaterControl,
	FilterRepeaterControl,
	injectIntoRepeaterHeaderActions,
	TransformBaseControl,
	TransformRepeaterControl,
	TransitionRepeaterControl,
	useBoundProp,
} from '@elementor/editor-controls';
import { useSelectedElement } from '@elementor/editor-elements';
import { EXPERIMENTAL_FEATURES, isExperimentActive } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

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
const TRANSFORM_BASE_LABEL = __( 'Transform base', 'elementor' );

export const EffectsSection = () => {
	const shouldShowTransition = isExperimentActive( EXPERIMENTAL_FEATURES.TRANSITIONS );
	const { element } = useSelectedElement();

	const transformBasePopoverAnchorRef = useRef< HTMLDivElement | null >( null );
	const setTransformBasePopoverAnchorRef = ( ref?: HTMLDivElement ) =>
		( transformBasePopoverAnchorRef.current = ref ?? null );

	injectIntoRepeaterHeaderActions( {
		id: 'transform-origin-control-trigger',
		component: () => <TransformOrigin containerRef={ transformBasePopoverAnchorRef } />,
		options: { overwrite: true },
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
				<TransformRepeaterControl setTransformBasePopoverAnchorRef={ setTransformBasePopoverAnchorRef }/>
			</StylesField>
			{ shouldShowTransition && (
				<>
					<PanelDivider />
					<StylesField bind="transition" propDisplayName={ TRANSITIONS_LABEL }>
						<TransitionRepeaterControl recentlyUsedList={ getRecentlyUsedList( element?.id ) } />
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

const TransformOrigin = ( { containerRef }: { containerRef: React.RefObject< HTMLDivElement > } ) => {
	const context = useBoundProp();

	return context.bind === 'transform' ? (
		<StylesField bind="" propDisplayName={ TRANSFORM_BASE_LABEL }>
			<TransformBaseControl anchorRef={ containerRef } />
		</StylesField>
	) : null;
};

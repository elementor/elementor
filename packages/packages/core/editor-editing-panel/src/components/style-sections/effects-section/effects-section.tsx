import * as React from 'react';
import { useRef } from 'react';
import {
	BoxShadowRepeaterControl,
	FilterRepeaterControl,
	injectIntoRepeaterHeaderActions,
	TransformOriginControl,
	TransformRepeaterControl,
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
	const isUnstableRepeaterActive = isExperimentActive( EXPERIMENTAL_FEATURES.UNSTABLE_REPEATER );

	const transformOriginPopoverAnchorRef = useRef< HTMLDivElement | null >( null );
	const setTransformOriginPopoverAnchorRef = ( ref?: HTMLDivElement ) =>
		( transformOriginPopoverAnchorRef.current = ref ?? null );

	injectIntoRepeaterHeaderActions( {
		id: 'transform-origin-control-trigger',
		component: () => <TransformOrigin containerRef={ transformOriginPopoverAnchorRef } />,
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
				{ isUnstableRepeaterActive ? (
					<UnstableTransformRepeaterControl
						setTransformOriginPopoverAnchorRef={ setTransformOriginPopoverAnchorRef }
					/>
				) : (
					<TransformRepeaterControl />
				) }
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

const TransformOrigin = ( { containerRef }: { containerRef: React.RefObject< HTMLDivElement > } ) => {
	const context = useBoundProp();

	return context.bind === 'transform' ? (
		<StylesField bind={ 'transform-origin' } propDisplayName={ TRANSFORM_ORIGIN_LABEL }>
			<TransformOriginControl anchorRef={ containerRef } />
		</StylesField>
	) : null;
};

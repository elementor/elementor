import * as React from 'react';
import { __ } from '@wordpress/i18n';

import { BackgroundSection } from './style-sections/background-section/background-section';
import { BorderSection } from './style-sections/border-section/border-section';
import { EffectsSection } from './style-sections/effects-section/effects-section';
import { LayoutSection } from './style-sections/layout-section/layout-section';
import { PositionSection } from './style-sections/position-section/position-section';
import { SizeSection } from './style-sections/size-section/size-section';
import { SpacingSection } from './style-sections/spacing-section/spacing-section';
import { TypographySection } from './style-sections/typography-section/typography-section';
import { StyleTabSection } from './style-tab-section';

export const StyleSections = () => {
	return (
		<>
			<StyleTabSection
				section={ {
					component: LayoutSection,
					name: 'Layout',
					title: __( 'Layout', 'elementor' ),
				} }
				fields={ [
					'display',
					'flex-direction',
					'flex-wrap',
					'justify-content',
					'align-items',
					'align-content',
					'align-self',
					'gap',
					'order',
					'grid-column',
					'grid-row',
					'grid-auto-rows',
					'grid-auto-columns',
				] }
			/>
			<StyleTabSection
				section={ {
					component: SpacingSection,
					name: 'Spacing',
					title: __( 'Spacing', 'elementor' ),
				} }
				fields={ [ 'margin', 'padding' ] }
			/>
			<StyleTabSection
				section={ {
					component: SizeSection,
					name: 'Size',
					title: __( 'Size', 'elementor' ),
				} }
				fields={ [
					'width',
					'min-width',
					'max-width',
					'height',
					'min-height',
					'max-height',
					'overflow',
					'aspect-ratio',
					'object-fit',
				] }
			/>
			<StyleTabSection
				section={ {
					component: PositionSection,
					name: 'Position',
					title: __( 'Position', 'elementor' ),
				} }
				fields={ [ 'position', 'z-index', 'scroll-margin-top' ] }
			/>
			<StyleTabSection
				section={ {
					component: TypographySection,
					name: 'Typography',
					title: __( 'Typography', 'elementor' ),
				} }
				fields={ [
					'font-family',
					'font-weight',
					'font-size',
					'text-align',
					'color',
					'line-height',
					'letter-spacing',
					'word-spacing',
					'column-count',
					'text-decoration',
					'text-transform',
					'direction',
					'font-style',
					'stroke',
				] }
			/>
			<StyleTabSection
				section={ {
					component: BackgroundSection,
					name: 'Background',
					title: __( 'Background', 'elementor' ),
				} }
				fields={ [ 'background' ] }
			/>
			<StyleTabSection
				section={ {
					component: BorderSection,
					name: 'Border',
					title: __( 'Border', 'elementor' ),
				} }
				fields={ [ 'border-radius', 'border-width', 'border-color', 'border-style' ] }
			/>
			<StyleTabSection
				section={ {
					component: EffectsSection,
					name: 'Effects',
					title: __( 'Effects', 'elementor' ),
				} }
				fields={ [
					'mix-blend-mode',
					'box-shadow',
					'opacity',
					'transform',
					'filter',
					'backdrop-filter',
					'transform-origin',
					'transition',
				] }
			/>
		</>
	);
};

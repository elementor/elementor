import * as React from 'react';
import { useState } from 'react';
import { CLASSES_PROP_KEY } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';
import { SessionStorageProvider } from '@elementor/session';
import { Box, Divider, Stack } from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import { ClassesPropProvider } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useScrollDirection } from '../contexts/scroll-context';
import { StyleProvider } from '../contexts/style-context';
import { StyleInheritanceProvider } from '../contexts/styles-inheritance-context';
import { useActiveStyleDefId } from '../hooks/use-active-style-def-id';
import { CssClassSelector } from './css-classes/css-class-selector';
import { SectionsList } from './sections-list';
import { BackgroundSection } from './style-sections/background-section/background-section';
import { BorderSection } from './style-sections/border-section/border-section';
import { EffectsSection } from './style-sections/effects-section/effects-section';
import { LayoutSection } from './style-sections/layout-section/layout-section';
import { PositionSection } from './style-sections/position-section/position-section';
import { SizeSection } from './style-sections/size-section/size-section';
import { SpacingSection } from './style-sections/spacing-section/spacing-section';
import { TypographySection } from './style-sections/typography-section/typography-section';
import { StyleTabSection } from './style-tab-section';

const TABS_HEADER_HEIGHT = '37px';

export const stickyHeaderStyles = {
	position: 'sticky',
	zIndex: 1100,
	opacity: 1,
	backgroundColor: 'background.default',
	transition: 'top 300ms ease',
};

export const StyleTab = () => {
	const currentClassesProp = useCurrentClassesProp();
	const [ activeStyleDefId, setActiveStyleDefId ] = useActiveStyleDefId( currentClassesProp );
	const [ activeStyleState, setActiveStyleState ] = useState< StyleDefinitionState | null >( null );
	const breakpoint = useActiveBreakpoint();

	return (
		<ClassesPropProvider prop={ currentClassesProp }>
			<StyleProvider
				meta={ { breakpoint, state: activeStyleState } }
				id={ activeStyleDefId }
				setId={ ( id: StyleDefinitionID | null ) => {
					setActiveStyleDefId( id );
					setActiveStyleState( null );
				} }
				setMetaState={ setActiveStyleState }
			>
				<SessionStorageProvider prefix={ activeStyleDefId ?? '' }>
					<StyleInheritanceProvider>
						<ClassesHeader>
							<CssClassSelector />
							<Divider />
						</ClassesHeader>
						<SectionsList>
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
								fields={ [ 'box-shadow', 'opacity', 'transform', 'filter', 'backdrop-filter' ] }
							/>
						</SectionsList>
						<Box sx={ { height: '150px' } } />
					</StyleInheritanceProvider>
				</SessionStorageProvider>
			</StyleProvider>
		</ClassesPropProvider>
	);
};

function ClassesHeader( { children }: { children: React.ReactNode } ) {
	const scrollDirection = useScrollDirection();

	return (
		<Stack sx={ { ...stickyHeaderStyles, top: scrollDirection === 'up' ? TABS_HEADER_HEIGHT : 0 } }>
			{ children }
		</Stack>
	);
}

function useCurrentClassesProp(): string {
	const { elementType } = useElement();

	const prop = Object.entries( elementType.propsSchema ).find(
		( [ , propType ] ) => propType.kind === 'plain' && propType.key === CLASSES_PROP_KEY
	);

	if ( ! prop ) {
		throw new Error( 'Element does not have a classes prop' );
	}

	return prop[ 0 ];
}

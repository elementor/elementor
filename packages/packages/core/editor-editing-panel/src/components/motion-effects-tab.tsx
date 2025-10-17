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
import { SectionsList } from './sections-list';
import { MotionEffectsSection } from '../components/style-sections/motion-effects-section/motion-effects-section';

const TABS_HEADER_HEIGHT = '37px';

export const stickyHeaderStyles = {
	position: 'sticky',
	zIndex: 1100,
	opacity: 1,
	backgroundColor: 'background.default',
	transition: 'top 300ms ease',
};

export const MotionEffectsTab = () => {
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
						<MotionEffectsHeader>
							<Divider />
						</MotionEffectsHeader>
						<SectionsList>
							<MotionEffectsSection />
						</SectionsList>
						<Box sx={ { height: '150px' } } />
					</StyleInheritanceProvider>
				</SessionStorageProvider>
			</StyleProvider>
		</ClassesPropProvider>
	);
};

function MotionEffectsHeader( { children }: { children: React.ReactNode } ) {
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

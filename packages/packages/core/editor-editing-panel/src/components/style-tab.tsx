import * as React from 'react';
import { useState } from 'react';
import { CLASSES_PROP_KEY } from '@elementor/editor-props';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';
import { createLocation } from '@elementor/locations';
import { SessionStorageProvider } from '@elementor/session';
import { Box, Divider, Stack } from '@elementor/ui';

import { ClassesPropProvider } from '../contexts/classes-prop-context';
import { useElement } from '../contexts/element-context';
import { useScrollDirection } from '../contexts/scroll-context';
import { StyleProvider } from '../contexts/style-context';
import { StyleInheritanceProvider } from '../contexts/styles-inheritance-context';
import { useActiveStyleDefId } from '../hooks/use-active-style-def-id';
import { CssClassSelector } from './css-classes/css-class-selector';
import { SectionsList } from './sections-list';
import { StyleSections } from './style-sections';

const TABS_HEADER_HEIGHT = '37px';

export const { Slot: StyleTabSlot, inject: injectIntoStyleTab } = createLocation();

export const stickyHeaderStyles = {
  position: 'sticky',
  zIndex: 1100,
  opacity: 1,
  backgroundColor: 'background.default',
  transition: 'top 300ms ease',
};

export const StyleTab = () => {
  const currentClassesProp = useCurrentClassesProp();
  const [ activeStyleDefId, setActiveStyleDefId ] = useActiveStyleDefId( currentClassesProp ?? '' );
  const [ activeStyleState, setActiveStyleState ] = useState< StyleDefinitionState | null >( null );
  const breakpoint = useActiveBreakpoint();

  if ( ! currentClassesProp ) {
    return null;
  }

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
              <StyleSections />
              <StyleTabSlot />
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

function useCurrentClassesProp(): string | null {
  const { elementType } = useElement();

  const prop = Object.entries( elementType.propsSchema ).find(
    ( [ , propType ] ) => propType.kind === 'plain' && propType.key === CLASSES_PROP_KEY
  );

  if ( ! prop ) {
    return null;
  }

  return prop[ 0 ];
}

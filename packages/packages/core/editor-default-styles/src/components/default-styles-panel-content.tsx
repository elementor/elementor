import { useMemo, useState } from 'react';
import {
  ControlActionsProvider,
  ControlReplacementsProvider,
  getControlReplacements,
} from '@elementor/editor-controls';
import {
  ClassesPropProvider,
  CreatableAutocomplete,
  ElementProvider,
  type Option,
  SectionsList,
  StyleInheritanceProvider,
  StyleProvider,
  StyleSections,
} from '@elementor/editor-editing-panel';
import { type Element, type ElementType } from '@elementor/editor-elements';
import {
  Panel,
  PanelBody,
  PanelFooter,
  PanelHeader,
  PanelHeaderTitle,
} from '@elementor/editor-panels';
import { useActiveBreakpoint } from '@elementor/editor-responsive';
import { type StyleDefinitionID, type StyleDefinitionState } from '@elementor/editor-styles';
import { ThemeProvider } from '@elementor/editor-ui';
import { controlActionsMenu } from '@elementor/menus';
import { useMutation } from '@elementor/query';
import { SessionStorageProvider, useSessionStorage } from '@elementor/session';
import { __useSelector as useSelector } from '@elementor/store';
import {
  type AutocompleteChangeReason,
  Box,
  Button,
  CloseButton,
  ErrorBoundary,
  FormControl,
  FormLabel,
  Stack,
} from '@elementor/ui';
import { __ } from '@wordpress/i18n';

import {
  type AllowedHtmlTag,
  getAllowedDefaultStyleTags,
  getDefaultActiveTag,
  isAllowedDefaultStyleTag,
} from '../allowed-tags';
import { saveDefaultStyles } from '../save-default-styles';
import { selectIsDirty } from '../store';
import { TagChip } from './tag-chip';

const { useMenuItems } = controlActionsMenu;

const SHIM_ELEMENT_ID = 'default-styles-editor-shim';
const SHIM_CLASSES_PROP = '__default_styles_classes__';
const TAG_SELECTOR_ID = 'default-styles-tag-selector';
const LAST_ACTIVE_TAG_SESSION_PREFIX = 'default-styles';
const LAST_ACTIVE_TAG_SESSION_KEY = 'last-active-tag';

function toTagChip( tag: AllowedHtmlTag ): Option {
  return { label: tag, value: tag, fixed: true };
}

const shimElement: Element = {
  id: SHIM_ELEMENT_ID,
  type: 'default-style',
};

const shimElementType: ElementType = {
  key: 'default-style',
  controls: [],
  propsSchema: {},
  title: __( 'Default Style', 'elementor' ),
};

type DefaultStylesPanelContentProps = {
  onRequestClose: () => void;
};

export function DefaultStylesPanelContent( { onRequestClose }: DefaultStylesPanelContentProps ) {
  const allowedTags = useMemo( () => getAllowedDefaultStyleTags(), [] );
  const tagOptions = useMemo< Option[] >(
    () => allowedTags.map( ( tag ) => ( { label: tag, value: tag } ) ),
    [ allowedTags ]
  );
  const [ storedTag, saveTag ] = useSessionStorage< AllowedHtmlTag >(
    LAST_ACTIVE_TAG_SESSION_KEY,
    LAST_ACTIVE_TAG_SESSION_PREFIX
  );
  const selectedTag = useMemo( () => {
    if ( storedTag && isAllowedDefaultStyleTag( storedTag, allowedTags ) ) {
      return storedTag;
    }

    return getDefaultActiveTag( allowedTags );
  }, [ allowedTags, storedTag ] );
  const [ activeStyleState, setActiveStyleState ] = useState< StyleDefinitionState | null >( null );
  const breakpoint = useActiveBreakpoint();
  const menuItems = useMenuItems().default;
  const controlReplacements = getControlReplacements();
  const isDirty = useSelector( selectIsDirty );
  const { mutateAsync: save, isPending: isSaving } = useSave();

  const setSelectedTag = ( tag: AllowedHtmlTag ) => {
    saveTag( tag );
  };

  const handleTagSelect = (
    _selected: Option[],
    reason: AutocompleteChangeReason,
    option: Option
  ) => {
    if ( reason !== 'selectOption' || ! option.value ) {
      return;
    }

    setSelectedTag( option.value as AllowedHtmlTag );
    setActiveStyleState( null );
  };

  return (
    <ErrorBoundary fallback={ null }>
      <ThemeProvider>
        <ControlActionsProvider items={ menuItems }>
          <ControlReplacementsProvider replacements={ controlReplacements }>
            <Panel>
              <PanelHeader>
                <Stack
                  p={ 1 }
                  pl={ 2 }
                  width="100%"
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={ 0.5 }
                >
                  <PanelHeaderTitle sx={ { flex: 1, minWidth: 0 } }>
                    { __( 'Default Styles', 'elementor' ) }
                  </PanelHeaderTitle>
                  <CloseButton
                    aria-label={ __( 'Close', 'elementor' ) }
                    sx={ { flexShrink: 0 } }
                    onClick={ onRequestClose }
                  />
                </Stack>
              </PanelHeader>
              <PanelBody>
                <Stack sx={ { px: 2, pt: 1, gap: 1 } }>
                  <FormControl fullWidth size="small">
                    <FormLabel htmlFor={ TAG_SELECTOR_ID } size="small" sx={ { mb: 1 } }>
                      { __( 'Tag', 'elementor' ) }
                    </FormLabel>
                    <CreatableAutocomplete< Option >
                      id={ TAG_SELECTOR_ID }
                      size="tiny"
                      placeholder={ __( 'Type tag name', 'elementor' ) }
                      options={ tagOptions }
                      selected={ [ toTagChip( selectedTag ) ] }
                      onSelect={ handleTagSelect }
                      renderTags={ ( values, getTagProps ) =>
                        values.map( ( value, index ) => (
                          <TagChip
                            key={ value.value ?? value.label }
                            label={ value.label }
                            chipProps={ getTagProps( { index } ) }
                            activeState={ activeStyleState }
                            onSelectState={ setActiveStyleState }
                          />
                        ) )
                      }
                    />
                  </FormControl>
                </Stack>
                <ElementProvider
                  element={ shimElement }
                  elementType={ shimElementType }
                  settings={ {} }
                >
                  <ClassesPropProvider prop={ SHIM_CLASSES_PROP }>
                    <StyleProvider
                      meta={ { breakpoint, state: activeStyleState } }
                      id={ selectedTag as StyleDefinitionID }
                      setId={ () => {} }
                      setMetaState={ setActiveStyleState }
                    >
                      <SessionStorageProvider prefix={ selectedTag }>
                        <StyleInheritanceProvider>
                          <SectionsList>
                            <StyleSections />
                          </SectionsList>
                          <Box sx={ { height: '150px' } } />
                        </StyleInheritanceProvider>
                      </SessionStorageProvider>
                    </StyleProvider>
                  </ClassesPropProvider>
                </ElementProvider>
              </PanelBody>
              <PanelFooter>
                <Button
                  fullWidth
                  size="small"
                  color="global"
                  variant="contained"
                  onClick={ () => void save() }
                  disabled={ ! isDirty }
                  loading={ isSaving }
                >
                  { __( 'Save changes', 'elementor' ) }
                </Button>
              </PanelFooter>
            </Panel>
          </ControlReplacementsProvider>
        </ControlActionsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

function useSave() {
  return useMutation( {
    mutationFn: () => saveDefaultStyles(),
  } );
}

import { injectIntoLogic } from '@elementor/editor';
import { toolsMenu } from '@elementor/editor-app-bar';
import { registerElementPanelDefaults } from '@elementor/editor-editing-panel';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __registerSlice as registerSlice } from '@elementor/store';

import { PopulateStore } from './components/populate-store';
import { panel } from './default-styles-panel';
import { defaultStylesStylesProvider } from './default-styles-styles-provider';
import { useDefaultStylesActionProps } from './hooks/use-default-styles-action-props';
import { slice } from './store';

const DEFAULT_STYLE_SECTION_NAMES = [
  'Layout',
  'Spacing',
  'Size',
  'Position',
  'Typography',
  'Background',
  'Border',
  'Effects',
] as const;

export function init() {
  registerSlice( slice );

  registerElementPanelDefaults( 'default-style', {
    defaultTab: 'style',
    defaultSectionsExpanded: {
      style: [ ...DEFAULT_STYLE_SECTION_NAMES ],
    },
  } );

  registerPanel( panel );

  stylesRepository.register( defaultStylesStylesProvider );

  toolsMenu.registerAction( {
    id: 'default-styles-button',
    priority: 4,
    useProps: useDefaultStylesActionProps,
  } );

  injectIntoLogic( {
    id: 'default-styles-populate-store',
    component: PopulateStore,
  } );
}

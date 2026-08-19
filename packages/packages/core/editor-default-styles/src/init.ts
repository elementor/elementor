import { injectIntoLogic } from '@elementor/editor';
import { registerElementPanelDefaults, STYLE_SECTION_NAMES } from '@elementor/editor-editing-panel';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __registerSlice as registerSlice } from '@elementor/store';

import { PopulateStore } from './components/populate-store';
import { defaultStylesStylesProvider } from './default-styles-provider';
import { slice } from './store';

export function init() {
	registerSlice( slice );

	registerElementPanelDefaults( 'default-style', {
		defaultTab: 'style',
		defaultSectionsExpanded: {
			style: [ ...STYLE_SECTION_NAMES ],
		},
	} );

	stylesRepository.register( defaultStylesStylesProvider );

	injectIntoLogic( {
		id: 'default-styles-populate-store',
		component: PopulateStore,
	} );
}

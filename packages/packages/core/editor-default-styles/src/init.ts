import { injectIntoLogic } from '@elementor/editor';
import { registerElementPanelDefaults } from '@elementor/editor-editing-panel';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { isExperimentActive } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';

import { PopulateStore } from './components/populate-store';
import { defaultStylesStylesProvider } from './default-styles-provider';
import { slice } from './store';

const DEFAULT_STYLES_EXPERIMENT = 'e_default_styles';

export function init() {
	if ( ! isExperimentActive( DEFAULT_STYLES_EXPERIMENT ) ) {
		return;
	}

	registerSlice( slice );

	registerElementPanelDefaults( 'default-style', {
		defaultTab: 'style',
		defaultSectionsExpanded: {
			style: [],
		},
	} );

	stylesRepository.register( defaultStylesStylesProvider );

	injectIntoLogic( {
		id: 'default-styles-populate-store',
		component: PopulateStore,
	} );
}

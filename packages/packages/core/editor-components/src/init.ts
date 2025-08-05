import { injectIntoLogic } from '@elementor/editor';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { EXPERIMENTAL_FEATURES, isExperimentActive } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';

import { PopulateStore } from './components/populate-store';
import { componentsStylesProvider } from './components-styles-provider';
import { slice } from './store';

export function init() {
	if ( ! isExperimentActive( EXPERIMENTAL_FEATURES.COMPONENTS ) ) {
		return;
	}

	injectIntoLogic( {
		id: 'components-styles-populate-store',
		component: PopulateStore,
	} );

	registerSlice( slice );

	stylesRepository.register( componentsStylesProvider );
}

import { stylesRepository } from '@elementor/editor-styles-repository';
import { __registerSlice as registerSlice } from '@elementor/store';

import { COMPONENTS_PROVIDER_KEY, componentsStylesProvider } from './components-styles-provider';
import { slice } from './store';
import { injectIntoLogic } from '@elementor/editor';
import { PopulateStore } from './components/populate-store';
import { EXPERIMENTAL_FEATURES, isExperimentActive } from '@elementor/editor-v1-adapters';

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

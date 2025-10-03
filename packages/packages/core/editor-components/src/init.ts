import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { settingsTransformersRegistry } from '@elementor/editor-canvas';
import { injectTab } from '@elementor/editor-elements-panel';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentIdTransformer } from './component-id-transformer';
import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { PopulateStore } from './populate-store';
import { slice } from './store';

export function init() {
	registerSlice( slice );

	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: Components,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	injectIntoLogic( {
		id: 'components-populate-store',
		component: PopulateStore,
	} );

	settingsTransformersRegistry.register( 'component-id', componentIdTransformer );
}

import { injectIntoTop } from '@elementor/editor';
import { settingsTransformersRegistry } from '@elementor/editor-canvas';
import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import { componentIdTransformer } from './component-id-transformer';
import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: Components,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	settingsTransformersRegistry.register( 'component-id', componentIdTransformer );
}

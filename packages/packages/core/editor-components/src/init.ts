import { injectIntoTop } from '@elementor/editor';
import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import { ComponentsList } from './components/components-tab/components-list';
import { CreateComponentForm } from './components/create-component-form/create-component-form';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsList,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );
}

import { injectIntoTop } from '@elementor/editor';
// import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import { ComponentsTab } from './components/components-tab';
import { CreateComponentForm } from './components/create-component-form/create-component-form';

export function init() {
	// injectTab( {
	// 	id: 'components',
	// 	label: __( 'Components', 'elementor' ),
	// 	component: ComponentsTab,
	// } );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );
}

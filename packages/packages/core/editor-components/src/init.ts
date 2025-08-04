import { injectIntoTop } from '@elementor/editor';
import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import { ComponentCreateForm } from './components/component-create-form';
import { ComponentsTab } from './components/components-tab';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsTab,
	} );

	injectIntoTop( {
		id: 'component-create-form',
		component: ComponentCreateForm,
	} );
}

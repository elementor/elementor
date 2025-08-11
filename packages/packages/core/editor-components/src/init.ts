import { injectTab, removeTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import { ComponentsTab } from './components/components-tab';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsTab,
	} );

	removeTab( 'global' );
}

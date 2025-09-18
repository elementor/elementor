import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { injectTab } from '@elementor/editor-elements-panel';
import { __ } from '@wordpress/i18n';

import './types';

import { ComponentsTab } from './components/components-tab';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { SyncWithDocumentSave } from './sync-with-document';

export function init() {
	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ComponentsTab,
	} );

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	window.components = {
		created: [],
		modified: [],
		deleted: [],
	};

	injectIntoLogic({
		id: 'components-sync-with-document',
		component: SyncWithDocumentSave,
	});
}

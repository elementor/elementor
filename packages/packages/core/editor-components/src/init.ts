import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { injectIntoTop } from '@elementor/editor';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { injectTab } from '@elementor/editor-elements-panel';
import { __registerSlice as registerSlice } from '@elementor/store';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, commandStartEvent } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { PopulateStore } from './populate-store';
import { slice } from './store';
import { componentsStylesProvider } from './store/components-styles-provider';
import { slice } from './store/components-styles-store';
import { loadComponentsStyles } from './store/load-components-styles';
import { removeComponentStyles } from './store/remove-component-styles';
import { type Element } from './types';

export function init() {
	registerSlice( slice );

	initStyles();

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

	listenTo( commandStartEvent( 'editor/documents/attach-preview' ), () => {
		const { id, config } = getV1CurrentDocument();

		if ( id ) {
			removeComponentStyles( id );
		}

		loadComponentsStyles( ( config?.elements as Element[] ) ?? [] );
	} );
}

function initStyles() {
	stylesRepository.register( componentsStylesProvider );

	registerSlice( slice );
}

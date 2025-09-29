import { injectIntoTop } from '@elementor/editor';
import { getCurrentDocumentId } from '@elementor/editor-elements';
import { injectTab } from '@elementor/editor-elements-panel';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, commandStartEvent, registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { addComponentStyles } from './store/add-component-styles';
import { componentsStylesProvider } from './store/components-styles-provider';
import { slice } from './store/components-styles-store';
import { removeComponentStyles } from './store/remove-component-styles';
import { type Element, type ExtendedWindow } from './types';
import { getComponentIds } from './utils/get-component-ids';

export function init() {
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

	listenTo( commandStartEvent( 'editor/documents/attach-preview' ), () => {
		const id = getCurrentDocumentId();

		if ( id ) {
			removeComponentStyles( id );
		}
	} );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		const extendedWindow = window as unknown as ExtendedWindow;
		const elements = extendedWindow.elementor.documents.currentDocument.config.elements as Element[];

		const componentIds = new Set( getComponentIds( elements ) );

		await addComponentStyles( Array.from( componentIds ) );
	} );
}

function initStyles() {
	stylesRepository.register( componentsStylesProvider );

	registerSlice( slice );
}

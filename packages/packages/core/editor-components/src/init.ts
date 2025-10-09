import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { injectTab } from '@elementor/editor-elements-panel';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, commandStartEvent } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { PopulateStore } from './populate-store';
import { componentsStylesProvider } from './store/components-styles-provider';
import { loadComponentsStyles } from './store/load-components-styles';
import { removeComponentStyles } from './store/remove-component-styles';
import { slice } from './store/store';
import { type Element } from './types';
import { createComponentType, TYPE } from './inject-element-view';
import { registerElementType } from '@elementor/editor-canvas';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { Args } from '@elementor/editor-v1-adapters/src/data-hooks/register-data-hook';

export function init() {
	stylesRepository.register(componentsStylesProvider);
	registerSlice(slice);
	registerElementType(TYPE, createComponentType);
	registerDataHook('dependency', 'editor/documents/close', (args: Args) => {
		const document = getV1CurrentDocument();
		if ( document.config.type === 'elementor_component' ) {
			args.mode = 'autosave';
		}
		return true;
	} );

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
	});
	
	listenTo( commandStartEvent( 'editor/documents/attach-preview' ), () => {
		const { id, config } = getV1CurrentDocument();

		if ( id ) {
			removeComponentStyles( id );
		}

		loadComponentsStyles( ( config?.elements as Element[] ) ?? [] );
	} );
}

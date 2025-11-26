import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import {
	type CreateTemplatedElementTypeOptions,
	registerElementType,
	settingsTransformersRegistry,
} from '@elementor/editor-canvas';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { type V1ElementData } from '@elementor/editor-elements';
import { injectTab } from '@elementor/editor-elements-panel';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __privateListenTo as listenTo, commandStartEvent, registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceTransformer } from './component-instance-transformer';
import { componentOverridableTransformer } from './component-overridable-transformer';
import { Components } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { EditComponent } from './components/edit-component/edit-component';
import { openEditModeDialog } from './components/in-edit-mode';
import { createComponentType, TYPE } from './create-component-type';
import { PopulateStore } from './populate-store';
import { componentsStylesProvider } from './store/components-styles-provider';
import { loadComponentsStyles } from './store/load-components-styles';
import { removeComponentStyles } from './store/remove-component-styles';
import { slice } from './store/store';
import { beforeSave } from './sync/before-save';
import { type ExtendedWindow } from './types';
import { onElementDrop } from './utils/tracking';

const COMPONENT_DOCUMENT_TYPE = 'elementor_component';

export function init() {
	stylesRepository.register( componentsStylesProvider );

	registerSlice( slice );

	registerElementType( TYPE, ( options: CreateTemplatedElementTypeOptions ) =>
		createComponentType( { ...options, showLockedByModal: openEditModeDialog } )
	);

	registerDataHook( 'dependency', 'editor/documents/close', ( args ) => {
		const document = getV1CurrentDocument();
		if ( document.config.type === COMPONENT_DOCUMENT_TYPE ) {
			args.mode = 'autosave';
		}
		return true;
	} );

	registerDataHook( 'after', 'preview/drop', onElementDrop );

	( window as unknown as ExtendedWindow ).elementorCommon.__beforeSave = beforeSave;

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

	injectIntoTop( {
		id: 'edit-component',
		component: EditComponent,
	} );

	listenTo( commandStartEvent( 'editor/documents/attach-preview' ), () => {
		const { id, config } = getV1CurrentDocument();

		if ( id ) {
			removeComponentStyles( id );
		}

		loadComponentsStyles( ( config?.elements as V1ElementData[] ) ?? [] );
	} );

	settingsTransformersRegistry.register( 'component-instance', componentInstanceTransformer );
	settingsTransformersRegistry.register( 'component-overridable', componentOverridableTransformer );
}

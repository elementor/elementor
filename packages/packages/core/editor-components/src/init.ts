import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import {
	type CreateTemplatedElementTypeOptions,
	registerElementType,
	settingsTransformersRegistry,
} from '@elementor/editor-canvas';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import {
	FIELD_TYPE,
	injectIntoPanelHeaderTop,
	registerControlReplacement,
	registerEditingPanelReplacement,
	registerFieldIndicator,
} from '@elementor/editor-editing-panel';
import { type V1ElementData } from '@elementor/editor-elements';
import { injectTab } from '@elementor/editor-elements-panel';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceTransformer } from './component-instance-transformer';
import { componentOverridableTransformer } from './component-overridable-transformer';
import { ComponentPanelHeader } from './components/component-panel-header/component-panel-header';
import { Components } from './components/components-tab/components';
import { COMPONENT_DOCUMENT_TYPE } from './components/consts';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { EditComponent } from './components/edit-component/edit-component';
import { openEditModeDialog } from './components/in-edit-mode';
import { InstanceEditPanel } from './components/instance-edit-panel/instance-edit-panel';
import { OverridablePropControl } from './components/overridable-props/overridable-prop-control';
import { OverridablePropIndicator } from './components/overridable-props/overridable-prop-indicator';
import { createComponentType, TYPE } from './create-component-type';
import { initMcp } from './mcp';
import { PopulateStore } from './populate-store';
import { componentOverridablePropTypeUtil } from './prop-types/component-overridable-prop-type';
import { loadComponentsAssets } from './store/actions/load-components-assets';
import { removeComponentStyles } from './store/actions/remove-component-styles';
import { componentsStylesProvider } from './store/components-styles-provider';
import { slice } from './store/store';
import { beforeSave } from './sync/before-save';
import { type ExtendedWindow } from './types';
import { onElementDrop } from './utils/tracking';

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

	injectIntoPanelHeaderTop( {
		id: 'component-panel-header',
		component: ComponentPanelHeader,
	} );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		const { id, config } = getV1CurrentDocument();

		if ( id ) {
			removeComponentStyles( id );
		}

		await loadComponentsAssets( ( config?.elements as V1ElementData[] ) ?? [] );
	} );

	registerFieldIndicator( {
		fieldType: FIELD_TYPE.SETTINGS,
		id: 'component-overridable-prop',
		priority: 1,
		indicator: OverridablePropIndicator,
	} );

	registerControlReplacement( {
		component: OverridablePropControl,
		condition: ( { value } ) => componentOverridablePropTypeUtil.isValid( value ),
	} );

	registerEditingPanelReplacement( {
		id: 'component-instance-edit-panel',
		condition: ( _, elementType ) => elementType.key === 'e-component',
		component: InstanceEditPanel,
	} );

	settingsTransformersRegistry.register( 'component-instance', componentInstanceTransformer );
	settingsTransformersRegistry.register( 'overridable', componentOverridableTransformer );

	initMcp();
}

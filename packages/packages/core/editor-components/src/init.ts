import { injectIntoLogic } from '@elementor/editor';
import {
	type CreateTemplatedElementTypeOptions,
	registerElementType,
	settingsTransformersRegistry,
} from '@elementor/editor-canvas';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import { registerEditingPanelReplacement } from '@elementor/editor-editing-panel';
import { type V1ElementData } from '@elementor/editor-elements';
import { injectTab } from '@elementor/editor-elements-panel';
import { embeddedDocumentsManager } from '@elementor/editor-embedded-documents-manager';
import { registerPanel } from '@elementor/editor-panels';
import { isSidebarEnabled, sidebarTools } from '@elementor/editor-sidebar';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceTransformer } from './component-instance-transformer';
import { componentOverridableTransformer } from './component-overridable-transformer';
import { componentOverrideTransformer } from './component-override-transformer';
import { ComponentsLegacyGuard } from './components/components-panel/components-legacy-guard';
import { panel } from './components/components-panel/panel';
import { Components } from './components/components-tab/components';
import { openDetachConfirmDialog } from './components/detach-instance-confirmation-dialog';
import { openEditModeDialog } from './components/in-edit-mode';
import { InstanceEditingPanel } from './components/instance-editing-panel/instance-editing-panel';
import { LoadTemplateComponents } from './components/load-template-components';
import { COMPONENT_WIDGET_TYPE, createComponentType } from './create-component-type';
import { useTogglePanelProps } from './hooks/use-toggle-panel-props';
import { PopulateStore } from './populate-store';
import { initCircularNestingPrevention } from './prevent-circular-nesting';
import { loadComponentsAssets } from './store/actions/load-components-assets';
import { removeComponentStyles } from './store/actions/remove-component-styles';
import { slice } from './store/store';
import { beforeSave } from './sync/before-save';
import { initLoadComponentDataAfterInstanceAdded } from './sync/load-component-data-after-instance-added';
import { type ExtendedWindow } from './types';

export function init() {
	registerSlice( slice );

	registerElementType( COMPONENT_WIDGET_TYPE, ( options: CreateTemplatedElementTypeOptions ) =>
		createComponentType( {
			...options,
			showLockedByModal: openEditModeDialog,
			showDetachConfirmDialog: openDetachConfirmDialog,
		} )
	);

	( window as unknown as ExtendedWindow ).elementorCommon.__beforeSave = beforeSave;

	registerComponentsEntry();

	injectIntoLogic( {
		id: 'components-populate-store',
		component: PopulateStore,
	} );

	registerDataHook( 'after', 'editor/documents/attach-preview', () => {
		const { id, config } = getV1CurrentDocument() ?? {};

		if ( ! id ) {
			return;
		}

		removeComponentStyles( id );

		void loadComponentsAssets( ( config?.elements as V1ElementData[] ) ?? [] );
	} );

	embeddedDocumentsManager.onDocumentLoad( ( _documentId, data ) => {
		void loadComponentsAssets( data.elements ?? [] );
	} );

	injectIntoLogic( {
		id: 'templates',
		component: LoadTemplateComponents,
	} );

	registerEditingPanelReplacement( {
		id: 'component-instance-edit-panel',
		condition: ( _, elementType ) => elementType.key === 'e-component',
		component: InstanceEditingPanel,
	} );

	settingsTransformersRegistry.register( 'component-instance', componentInstanceTransformer );
	settingsTransformersRegistry.register( 'overridable', componentOverridableTransformer );
	settingsTransformersRegistry.register( 'override', componentOverrideTransformer );

	initCircularNestingPrevention();

	initLoadComponentDataAfterInstanceAdded();
}

function registerComponentsEntry() {
	if ( isSidebarEnabled() ) {
		registerPanel( panel );

		injectIntoLogic( {
			id: 'components-legacy-guard',
			component: ComponentsLegacyGuard,
		} );

		sidebarTools.registerToggleAction( {
			id: 'open-components-panel',
			group: 'design',
			priority: 5,
			useProps: useTogglePanelProps,
		} );

		return;
	}

	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: Components,
		position: 1,
	} );
}

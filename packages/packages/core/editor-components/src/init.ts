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
import { stylesRepository } from '@elementor/editor-styles-repository';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __registerSlice as registerSlice } from '@elementor/store';
import { __ } from '@wordpress/i18n';

import { componentInstanceTransformer } from './component-instance-transformer';
import { componentOverridableTransformer } from './component-overridable-transformer';
import { componentOverrideTransformer } from './component-override-transformer';
import { Components } from './components/components-tab/components';
import { openEditModeDialog } from './components/in-edit-mode';
import { InstanceEditingPanel } from './components/instance-editing-panel/instance-editing-panel';
import { LoadTemplateComponents } from './components/load-template-components';
import { COMPONENT_WIDGET_TYPE, createComponentType } from './create-component-type';
import { initExtended } from './extended/init';
import { PopulateStore } from './populate-store';
import { initCircularNestingPrevention } from './prevent-circular-nesting';
import { loadComponentsAssets } from './store/actions/load-components-assets';
import { removeComponentStyles } from './store/actions/remove-component-styles';
import { componentsStylesProvider } from './store/components-styles-provider';
import { slice } from './store/store';
import { beforeSave } from './sync/before-save';
import { initLoadComponentDataAfterInstanceAdded } from './sync/load-component-data-after-instance-added';
import { type ExtendedWindow } from './types';

export function init() {
	stylesRepository.register( componentsStylesProvider );

	registerSlice( slice );

	registerElementType( COMPONENT_WIDGET_TYPE, ( options: CreateTemplatedElementTypeOptions ) =>
		createComponentType( { ...options, showLockedByModal: openEditModeDialog } )
	);

	( window as unknown as ExtendedWindow ).elementorCommon.__beforeSave = beforeSave;

	injectTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: Components,
		position: 1,
	} );

	injectIntoLogic( {
		id: 'components-populate-store',
		component: PopulateStore,
	} );

	registerDataHook( 'after', 'editor/documents/attach-preview', async () => {
		const { id, config } = getV1CurrentDocument();

		if ( id ) {
			removeComponentStyles( id );
		}

		await loadComponentsAssets( ( config?.elements as V1ElementData[] ) ?? [] );
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

	initExtended();
}

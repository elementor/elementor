import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { registerControlReplacement } from '@elementor/editor-controls';
import { getV1CurrentDocument } from '@elementor/editor-documents';
import {
	FIELD_TYPE,
	injectIntoPanelHeaderTop,
	registerEditingPanelReplacement,
	registerFieldIndicator,
} from '@elementor/editor-editing-panel';
import { registerTab } from '@elementor/editor-elements-panel';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { registerDataHook } from '@elementor/editor-v1-adapters';
import { __ } from '@wordpress/i18n';

import { componentOverridablePropTypeUtil } from '../prop-types/component-overridable-prop-type';
import { type ExtendedWindow } from '../types';
import { onElementDrop } from '../utils/tracking';
import { ComponentPanelHeader } from './components/component-panel-header/component-panel-header';
import { panel as componentPropertiesPanel } from './components/component-properties-panel/component-properties-panel';
import { ExtendedComponents } from './components/components-tab/components';
import { CreateComponentForm } from './components/create-component-form/create-component-form';
import { EditComponent } from './components/edit-component/edit-component';
import { ExtendedInstanceEditingPanel } from './components/instance-editing-panel/instance-editing-panel';
import { OverridablePropControl } from './components/overridable-props/overridable-prop-control';
import { OverridablePropIndicator } from './components/overridable-props/overridable-prop-indicator';
import { COMPONENT_DOCUMENT_TYPE, OVERRIDABLE_PROP_REPLACEMENT_ID } from './consts';
import { initMcp } from './mcp';
import { beforeSave } from './sync/before-save';
import { initCleanupOverridablePropsOnDelete } from './sync/cleanup-overridable-props-on-delete';
import { initHandleComponentEditModeContainer } from './sync/handle-component-edit-mode-container';
import { initNonAtomicNestingPrevention } from './sync/prevent-non-atomic-nesting';
import { initRevertOverridablesOnCopyOrDuplicate } from './sync/revert-overridables-on-copy-or-duplicate';
import { SanitizeOverridableProps } from './sync/sanitize-overridable-props';

export function initExtended() {
	registerEditingPanelReplacement( {
		id: 'component-instance-edit-panel',
		condition: ( _, elementType ) => elementType.key === 'e-component',
		component: ExtendedInstanceEditingPanel,
	} );

	registerTab( {
		id: 'components',
		label: __( 'Components', 'elementor' ),
		component: ExtendedComponents,
	} );

	registerPanel( componentPropertiesPanel );

	registerDataHook( 'dependency', 'editor/documents/close', ( args ) => {
		const document = getV1CurrentDocument();
		if ( document.config.type === COMPONENT_DOCUMENT_TYPE ) {
			args.mode = 'autosave';
		}
		return true;
	} );

	registerDataHook( 'after', 'preview/drop', onElementDrop );

	( window as unknown as ExtendedWindow ).elementorCommon.__beforeSave = beforeSave;

	injectIntoTop( {
		id: 'create-component-popup',
		component: CreateComponentForm,
	} );

	injectIntoTop( {
		id: 'edit-component',
		component: EditComponent,
	} );

	injectIntoPanelHeaderTop( {
		id: 'component-panel-header',
		component: ComponentPanelHeader,
	} );

	registerFieldIndicator( {
		fieldType: FIELD_TYPE.SETTINGS,
		id: 'component-overridable-prop',
		priority: 1,
		indicator: OverridablePropIndicator,
	} );

	registerControlReplacement( {
		id: OVERRIDABLE_PROP_REPLACEMENT_ID,
		component: OverridablePropControl,
		condition: ( { value } ) => componentOverridablePropTypeUtil.isValid( value ),
	} );

	initCleanupOverridablePropsOnDelete();

	initMcp();

	initNonAtomicNestingPrevention();

	initHandleComponentEditModeContainer();

	initRevertOverridablesOnCopyOrDuplicate();

	injectIntoLogic( {
		id: 'sanitize-overridable-props',
		component: SanitizeOverridableProps,
	} );
}

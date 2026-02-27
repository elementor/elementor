import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { registerControlReplacement } from '@elementor/editor-controls';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { isTransformable, type PropValue } from '@elementor/editor-props';
import { controlActionsMenu } from '@elementor/menus';

import { GlobalStylesImportListener } from './components/global-styles-import-listener';
import { OpenPanelFromUrl } from './components/open-panel-from-url';
import { panel } from './components/variables-manager/variables-manager-panel';
import { VariableControl } from './controls/variable-control';
import { usePropVariableAction } from './hooks/use-prop-variable-action';
import { initMcp } from './mcp';
import { registerVariableTypes } from './register-variable-types';
import { StyleVariablesRenderer } from './renderers/style-variables-renderer';
import { registerRepeaterInjections } from './repeater-injections';
import { service as variablesService } from './service';
import { hasVariableType } from './variables-registry/variable-type-registry';

const { registerPopoverAction } = controlActionsMenu;

export function init() {
	registerVariableTypes();
	registerRepeaterInjections();

	registerControlReplacement( {
		component: VariableControl,
		condition: ( { value, placeholder } ) => {
			if ( hasVariableAssigned( value ) ) {
				return true;
			}

			if ( value ) {
				return false;
			}

			return hasVariableAssigned( placeholder );
		},
	} );

	registerPopoverAction( {
		id: 'variables',
		priority: 40,
		useProps: usePropVariableAction,
	} );

	variablesService.init().then( () => {
		initMcp();
	} );

	injectIntoTop( {
		id: 'canvas-style-variables-render',
		component: StyleVariablesRenderer,
	} );

	injectIntoLogic( {
		id: 'variables-import-listener',
		component: GlobalStylesImportListener,
	} );

	injectIntoLogic( {
		id: 'variables-open-panel-from-url',
		component: OpenPanelFromUrl,
	} );

	registerPanel( panel );
}

function hasVariableAssigned( value: PropValue ) {
	if ( isTransformable( value ) ) {
		return hasVariableType( value.$$type );
	}

	return false;
}

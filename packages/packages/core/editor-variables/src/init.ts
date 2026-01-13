import { injectIntoTop } from '@elementor/editor';
import { controlActionsMenu, registerControlReplacement } from '@elementor/editor-editing-panel';
import { __registerPanel as registerPanel } from '@elementor/editor-panels';
import { isTransformable, type PropValue } from '@elementor/editor-props';

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
		useProps: usePropVariableAction,
	} );

	variablesService.init().then( () => {
		initMcp();
	} );

	injectIntoTop( {
		id: 'canvas-style-variables-render',
		component: StyleVariablesRenderer,
	} );

	registerPanel( panel );
}

function hasVariableAssigned( value: PropValue ) {
	if ( isTransformable( value ) ) {
		return hasVariableType( value.$$type );
	}

	return false;
}

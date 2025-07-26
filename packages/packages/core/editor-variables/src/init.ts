import { injectIntoTop } from '@elementor/editor';
import { controlActionsMenu, registerControlReplacement } from '@elementor/editor-editing-panel';
import type { PropValue } from '@elementor/editor-props';

import { VariableControl } from './controls/variable-control';
import { usePropVariableAction } from './hooks/use-prop-variable-action';
import { registerColorVariableType } from './register-color-variable-type';
import { registerFontVariableType } from './register-font-variable-type';
import { StyleVariablesRenderer } from './renderers/style-variables-renderer';
import { service as variablesService } from './service';
import { hasVariableType } from './variables-registry/variable-type-registry';

const { registerPopoverAction } = controlActionsMenu;

export function init() {
	registerColorVariableType();
	registerFontVariableType();

	registerControlReplacement( {
		component: VariableControl,
		condition: ( { value } ) => hasAssignedVariable( value ),
	} );

	registerPopoverAction( {
		id: 'variables',
		useProps: usePropVariableAction,
	} );

	variablesService.init();

	injectIntoTop( {
		id: 'canvas-style-variables-render',
		component: StyleVariablesRenderer,
	} );
}

function hasAssignedVariable( propValue: PropValue ) {
	if ( propValue && typeof propValue === 'object' && '$$type' in propValue ) {
		return hasVariableType( propValue.$$type );
	}

	return false;
}

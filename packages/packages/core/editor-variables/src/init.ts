import { injectIntoTop } from '@elementor/editor';
import { controlActionsMenu, registerControlReplacement } from '@elementor/editor-editing-panel';
import type { TransformablePropValue } from '@elementor/editor-props';

import { VariableControl } from './controls/variable-control';
import { usePropVariableAction } from './hooks/use-prop-variable-action';
import { registerColorVariable } from './register-color-variable';
import { registerFontVariable } from './register-font-variable';
import { StyleVariablesRenderer } from './renderers/style-variables-renderer';
import { service as variablesService } from './service';
import { hasAssignedVariable } from './utils';

const { registerPopoverAction } = controlActionsMenu;

export function init() {
	registerControlReplacement( {
		component: VariableControl,
		condition: ( { value } ) => hasAssignedVariable( value as TransformablePropValue< string, string > ),
	} );

	registerPopoverAction( {
		id: 'variables',
		useProps: usePropVariableAction,
	} );

	registerColorVariable();
	registerFontVariable();

	variablesService.init();

	injectIntoTop( {
		id: 'canvas-style-variables-render',
		component: StyleVariablesRenderer,
	} );
}

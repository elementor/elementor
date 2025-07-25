import { injectIntoTop } from '@elementor/editor';
import { controlActionsMenu } from '@elementor/editor-editing-panel';

import { usePropVariableAction } from './hooks/use-prop-variable-action';
import { registerColorVariableType } from './register-color-variable-type';
import { registerFontVariableType } from './register-font-variable-type';
import { StyleVariablesRenderer } from './renderers/style-variables-renderer';
import { service as variablesService } from './service';

const { registerPopoverAction } = controlActionsMenu;

export function init() {
	registerColorVariableType();
	registerFontVariableType();

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

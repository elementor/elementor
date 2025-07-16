import { injectIntoTop } from '@elementor/editor';

import { initColorVariables } from './init-color-variables';
import { initFontVariables } from './init-font-variables';
import { initSizeVariables } from './init-size-variables';
import { StyleVariablesRenderer } from './renderers/style-variables-renderer';
import { service as variablesService } from './service';

export function init() {
	initColorVariables();
	initFontVariables();
	initSizeVariables();

	variablesService.init();

	injectIntoTop( {
		id: 'canvas-style-variables-render',
		component: StyleVariablesRenderer,
	} );
}

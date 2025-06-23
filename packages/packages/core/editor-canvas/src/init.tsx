import { injectIntoTop } from '@elementor/editor';

import { ElementsOverlays } from './components/elements-overlays';
import { StyleRenderer } from './components/style-renderer';
import { initSettingsTransformers } from './init-settings-transformers';
import { initStyleTransformers } from './init-style-transformers';
import { initLegacyViews } from './legacy/init-legacy-views';
import { initLinkInLinkPrevention } from './prevent-link-in-link-commands';
import { initStyleCommands } from './style-commands/init-style-commands';

export function init() {
	initStyleTransformers();
	initStyleCommands();

	initLinkInLinkPrevention();

	initLegacyViews();

	initSettingsTransformers();

	injectIntoTop( {
		id: 'elements-overlays',
		component: ElementsOverlays,
	} );

	injectIntoTop( {
		id: 'canvas-style-render',
		component: StyleRenderer,
	} );
}

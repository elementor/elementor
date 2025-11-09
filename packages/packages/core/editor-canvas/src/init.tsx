import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { init as initInteractionsRepository } from '@elementor/editor-interactions';

import { ClassesRename } from './components/classes-rename';
import { ElementsOverlays } from './components/elements-overlays';
import { InteractionsRenderer } from './components/interactions-renderer';
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

	console.log( '[Canvas Init] About to initialize interactions repository' );
	initInteractionsRepository();
	console.log( '[Canvas Init] Interactions repository initialized' );

	injectIntoTop( {
		id: 'elements-overlays',
		component: ElementsOverlays,
	} );

	injectIntoTop( {
		id: 'canvas-style-render',
		component: StyleRenderer,
	} );

	console.log( '[Canvas Init] About to inject InteractionsRenderer' );
	injectIntoTop( {
		id: 'canvas-interactions-render',
		component: InteractionsRenderer,
	} );
	console.log( '[Canvas Init] InteractionsRenderer injected' );

	injectIntoLogic( {
		id: 'classes-rename',
		component: ClassesRename,
	} );
}

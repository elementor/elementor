import { injectIntoLogic, injectIntoTop } from '@elementor/editor';
import { init as initInteractionsRepository } from '@elementor/editor-interactions';
import { getMCPByDomain } from '@elementor/editor-mcp';

import { ClassesRename } from './components/classes-rename';
import { ElementsOverlays } from './components/elements-overlays';
import { InteractionsRenderer } from './components/interactions-renderer';
import { StyleRenderer } from './components/style-renderer';
import { initSettingsTransformers } from './init-settings-transformers';
import { initStyleTransformers } from './init-style-transformers';
import { initLegacyViews } from './legacy/init-legacy-views';
import { initCanvasMcp } from './mcp/canvas-mcp';
import { mcpDescription } from './mcp/mcp-description';
import { initLinkInLinkPrevention } from './prevent-link-in-link-commands';
import { ReplacementManager } from './replacements/replacement-manager';
import { initStyleCommands } from './style-commands/init-style-commands';

export function init() {
	initStyleTransformers();
	initStyleCommands();

	initLinkInLinkPrevention();

	initLegacyViews();

	initSettingsTransformers();

	initInteractionsRepository();

	injectIntoTop( {
		id: 'elements-overlays',
		component: ElementsOverlays,
	} );

	injectIntoTop( {
		id: 'canvas-style-render',
		component: StyleRenderer,
	} );

	injectIntoTop( {
		id: 'canvas-interactions-render',
		component: InteractionsRenderer,
	} );

	injectIntoTop( {
		id: 'replacement-manager',
		component: ReplacementManager,
	} );

	injectIntoLogic( {
		id: 'classes-rename',
		component: ClassesRename,
	} );

	initCanvasMcp(
		getMCPByDomain( 'canvas', {
			instructions: mcpDescription,
		} )
	);
}

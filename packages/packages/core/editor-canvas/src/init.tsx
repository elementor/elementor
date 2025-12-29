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
import { initViewReplacements } from './legacy/replacements/manager';
import { initCanvasMcp } from './mcp/canvas-mcp';
import { mcpDescription } from './mcp/mcp-description';
import { initLinkInLinkPrevention } from './prevent-link-in-link-commands';
import { initStyleCommands } from './style-commands/init-style-commands';
import { initStyleSheetResource } from './mcp/resources/style-sheet-resource';

export function init() {
	initStyleTransformers();
	initStyleCommands();

	initLinkInLinkPrevention();

	initViewReplacements();

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

	injectIntoLogic( {
		id: 'classes-rename',
		component: ClassesRename,
	} );

	initCanvasMcp(
		getMCPByDomain( 'canvas', {
			instructions: mcpDescription,
		} )
	);

	initStyleSheetResource(
		getMCPByDomain( 'canvas' ),
	);
}

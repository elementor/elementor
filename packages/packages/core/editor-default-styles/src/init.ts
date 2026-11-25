import { injectIntoLogic } from '@elementor/editor';
import { registerElementPanelDefaults } from '@elementor/editor-editing-panel';
import { getMCPByDomain } from '@elementor/editor-mcp';
import { stylesRepository } from '@elementor/editor-styles-repository';
import { __registerSlice as registerSlice } from '@elementor/store';

import { GlobalStylesImportListener } from './components/global-styles-import-listener';
import { PopulateStore } from './components/populate-store';
import { defaultStylesStylesProvider } from './default-styles-provider';
import { DEFAULT_STYLES_MCP_NAMESPACE, initMcp } from './mcp';
import { slice } from './store';

export function init() {
	registerSlice( slice );

	registerElementPanelDefaults( 'default-style', {
		defaultTab: 'style',
		defaultSectionsExpanded: {
			style: [],
		},
	} );

	stylesRepository.register( defaultStylesStylesProvider );

	injectIntoLogic( {
		id: 'default-styles-import-listener',
		component: GlobalStylesImportListener,
	} );

	injectIntoLogic( {
		id: 'default-styles-populate-store',
		component: PopulateStore,
	} );

	initMcp(
		getMCPByDomain( DEFAULT_STYLES_MCP_NAMESPACE, {
			instructions: 'MCP server for management of Elementor default styles',
			docs: `Everything related to V4 ( Atomic ) site-wide default styles.
# Default styles
- Update/delete default styles by HTML wrapper tag
- Get default styles for a tag via get-default-styles
`,
		} )
	);
}

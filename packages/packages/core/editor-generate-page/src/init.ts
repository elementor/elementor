import { getMCPByDomain } from '@elementor/editor-mcp';

import { initGeneratePageTool } from './mcp/tool';

export function init() {
	const reg = getMCPByDomain( 'generatepage', {
		instructions:
			'Generate and persist a full Elementor V4 page from a content tree and optional companion classes/variables. Read the generate-page docs resources before using the tool.',
	} );

	initGeneratePageTool( reg );
}

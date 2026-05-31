import { getMCPByDomain } from '@elementor/editor-mcp';

import { initGeneratePageCustomCssTool } from './mcp/tool';

export function init() {
	const reg = getMCPByDomain( 'generatepagecustomcss', {
		instructions:
			'Generate and persist a full Elementor V4 page from a content tree using raw CSS in custom_css (base64-encoded declarations). Read the generate-page-custom-css docs resources before using the tool.',
	} );

	initGeneratePageCustomCssTool( reg );
}

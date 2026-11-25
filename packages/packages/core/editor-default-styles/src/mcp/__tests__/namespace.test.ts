import type * as EditorMcp from '@elementor/editor-mcp';

import { DEFAULT_STYLES_MCP_NAMESPACE } from '../index';

const { getMCPByDomain } = jest.requireActual< typeof EditorMcp >( '@elementor/editor-mcp' );

describe( 'default styles MCP namespace', () => {
	it( 'should be accepted by the MCP registry', () => {
		expect( () => getMCPByDomain( DEFAULT_STYLES_MCP_NAMESPACE ) ).not.toThrow();
	} );
} );

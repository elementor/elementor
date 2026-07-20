import { getCurrentDocument } from '@elementor/editor-documents';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

import { getMcpErrorMessage } from '../../utils/get-mcp-error-message';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

type GetPageStructureResponse = {
	elements: Array< Record< string, unknown > >;
};

export const initGetPageStructureTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'get-page-structure',
		description:
			'Returns the Elementor element tree (widgets, containers, and nested content) for a post or page. ' +
			'If no postId is provided, uses the currently open document. Only works for posts saved with Elementor.',
		schema: {
			postId: z
				.number()
				.optional()
				.describe(
					'WordPress post ID of the Elementor document. If omitted, uses the currently open document.'
				),
		},
		outputSchema: {
			elements: z
				.array( z.any() )
				.describe( 'Root-level Elementor elements for the document.' ),
		},
		handler: async ( { postId } ) => {
			const resolvedPostId = postId ?? getCurrentDocument()?.id;

			if ( ! resolvedPostId ) {
				throw new Error( 'No post ID provided and no active document found.' );
			}

			try {
				const { data } = await httpService().post< HttpResponse< GetPageStructureResponse > >( MCP_PROXY_URL, {
					tool: 'get-page-structure',
					input: {
						post_id: resolvedPostId,
					},
				} );

				return {
					elements: data.data.elements,
				};
			} catch ( error ) {
				throw new Error( getMcpErrorMessage( error, 'get-page-structure' ) );
			}
		},
	} );
};

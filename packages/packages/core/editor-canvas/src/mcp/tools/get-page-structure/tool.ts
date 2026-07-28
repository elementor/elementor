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
			'Returns a lean Elementor element tree skeleton (id, elType, widgetType, nested elements) for a post or page. ' +
			'If no postId is provided, uses the currently open document. Optionally scope to a subtree with elementId. ' +
			"Set includeContent=true (requires elementId) to also return each node's settings and styles.",
		schema: {
			postId: z
				.number()
				.optional()
				.describe(
					'WordPress post ID of the Elementor document. If omitted, uses the currently open document.'
				),
			elementId: z
				.string()
				.optional()
				.describe( 'If provided, returns only the subtree rooted at that element id.' ),
			includeContent: z
				.boolean()
				.optional()
				.describe(
					"If true, includes each node's settings and styles (same shape build-composition accepts as input). Requires elementId."
				),
		},
		outputSchema: {
			elements: z
				.array( z.any() )
				.describe(
					'Skeleton of Elementor elements (id, elType, widgetType, nested elements). When includeContent is true, each node also includes settings and styles.'
				),
		},
		handler: async ( { postId, elementId, includeContent } ) => {
			const resolvedPostId = postId ?? getCurrentDocument()?.id;

			if ( ! resolvedPostId ) {
				throw new Error( 'No post ID provided and no active document found.' );
			}

			try {
				const { data } = await httpService().post< HttpResponse< GetPageStructureResponse > >( MCP_PROXY_URL, {
					tool: 'get-page-structure',
					input: {
						post_id: resolvedPostId,
						...( elementId ? { element_id: elementId } : {} ),
						...( includeContent ? { include_content: true } : {} ),
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

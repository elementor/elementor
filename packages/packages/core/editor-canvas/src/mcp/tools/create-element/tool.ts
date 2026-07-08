import { getCurrentDocument } from '@elementor/editor-documents';
import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { type HttpResponse, httpService } from '@elementor/http-client';
import { z } from '@elementor/schema';

const MCP_PROXY_URL = 'elementor/v1/mcp-proxy';

type CreateElementResponse = {
	success: boolean;
	post_id: number;
	element_id: string;
	version: string;
	preview_url: string;
};

export const initCreateElementTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;

	addTool( {
		name: 'create-element',
		description:
			'Insert a new element into the current Elementor document via the server-side MCP ability. ' +
			'The document is saved as a draft. Reload the editor after calling this tool to see the result.',
		schema: {
			elementType: z
				.string()
				.describe( "Registry identifier of the element to create, e.g. 'e-heading', 'e-flexbox'." ),
			parentId: z
				.string()
				.optional()
				.describe( "ID of the parent container. Omit or pass 'document' to insert at the document root." ),
		},
		outputSchema: {
			elementId: z.string(),
			previewUrl: z.string(),
			version: z.string(),
		},
		handler: async ( { elementType, parentId } ) => {
			const document = getCurrentDocument();

			if ( ! document?.id ) {
				throw new Error( 'No active document found.' );
			}

			const { data } = await httpService().post< HttpResponse< CreateElementResponse > >( MCP_PROXY_URL, {
				tool: 'create-element',
				input: {
					parent_id: parentId ?? 'document',
					element: { type: elementType },
					post_id: document.id,
				},
			} );

			return {
				elementId: data.data.element_id,
				previewUrl: data.data.preview_url,
				version: data.data.version,
			};
		},
	} );
};

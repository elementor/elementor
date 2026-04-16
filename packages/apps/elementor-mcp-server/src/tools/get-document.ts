import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WpClient, AuthContext } from '../lib/wp-client.js';

interface DocumentResponse {
	post_id: number;
	title: string;
	status: string;
	tree: unknown[];
}

export function registerGetDocument(server: McpServer, client: WpClient, getAuth: () => AuthContext): void {
	server.tool(
		'get_document_tree',
		'Fetch the Elementor document tree for a specific page. Returns a simplified element tree showing IDs, widget types, and settings.',
		{ post_id: z.number().int().positive().describe('WordPress post/page ID') },
		async ({ post_id }) => {
			const auth = getAuth();
			// Uses the custom Elementor OAuth endpoint which reads _elementor_data directly.
			const doc = await client.get<DocumentResponse>(
				`/elementor/v1/oauth/document/${post_id}`,
				auth
			);

			return {
				content: [{ type: 'text', text: JSON.stringify(doc, null, 2) }],
			};
		}
	);
}

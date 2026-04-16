import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WpClient, AuthContext } from '../lib/wp-client.js';

interface WpPage {
	id: number;
	status: string;
}

export function registerSaveDraft(server: McpServer, client: WpClient, getAuth: () => AuthContext): void {
	server.tool(
		'save_draft',
		'Save an Elementor page as a draft. The page will not be publicly visible until published.',
		{ post_id: z.number().int().positive().describe('WordPress post/page ID to save as draft') },
		async ({ post_id }) => {
			const auth = getAuth();
			const result = await client.put<WpPage>(
				`/wp/v2/pages/${post_id}`,
				{ status: 'draft' },
				auth
			);

			return {
				content: [{
					type: 'text',
					text: JSON.stringify({
						ok: true,
						post_id: result.id,
						status: result.status,
					}, null, 2),
				}],
			};
		}
	);
}

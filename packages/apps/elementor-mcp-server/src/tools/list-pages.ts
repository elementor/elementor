import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WpClient, AuthContext } from '../lib/wp-client.js';

interface WpPage {
	id: number;
	title: { rendered: string };
	status: string;
	link: string;
	modified: string;
}

export function registerListPages(server: McpServer, client: WpClient, getAuth: () => AuthContext): void {
	server.tool(
		'list_pages',
		'List all WordPress pages built with Elementor. Returns page ID, title, URL, and status.',
		{},
		async () => {
			const auth = getAuth();
			const pages = await client.get<WpPage[]>(
				'/wp/v2/pages?per_page=50&meta_key=_elementor_edit_mode&meta_value=builder&_fields=id,title,status,link,modified',
				auth
			);

			const items = pages.map((p) => ({
				id: p.id,
				title: p.title.rendered,
				status: p.status,
				url: p.link,
				modified: p.modified,
			}));

			return {
				content: [{ type: 'text', text: JSON.stringify(items, null, 2) }],
			};
		}
	);
}

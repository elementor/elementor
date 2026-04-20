import { type McpServer } from '@elementor/editor-mcp';
import { callWpApi } from '@elementor/elementor-mcp-common';

type WPPage = {
	id: number;
	title: { rendered: string };
	link: string;
	status: string;
	modified: string;
	type: string;
};

export const PAGES_LIST_RESOURCE_URI = 'wp://pages/list';

export function addPagesListResource( server: McpServer ) {
	server.registerResource(
		'wp-pages-list',
		PAGES_LIST_RESOURCE_URI,
		{
			title: 'List of wordpress pages',
			description:
				'List of all WordPress pages with their IDs, titles, status, and metadata. Use this to get available pages before navigation or editing.',
		},
		async ( uri ) => {
			try {
				const response = await callWpApi< WPPage[] >(
					'/wp/v2/pages?per_page=100&orderby=modified&order=desc',
					'GET'
				);
				const pages = response.data;
				if ( ! Array.isArray( pages ) ) {
					throw new Error( 'Invalid response format from wordpress pages API' );
				}
				const pagesList = pages.map( ( page ) => ( {
					id: page.id,
					title: page.title.rendered,
					status: page.status,
					link: page.link,
					modified: page.modified,
					type: page.type,
				} ) );
				return {
					contents: [
						{
							uri: uri.href,
							mimeType: 'application/json',
							text: JSON.stringify(
								{
									pages: pagesList,
									total: pagesList.length,
									message: 'List of all available wordpress pages',
								},
								null,
								2
							),
						},
					],
				};
			} catch ( error ) {
				throw new Error( `Failed to fetch pages list: ${ ( error as Error ).message }` );
			}
		}
	);
}

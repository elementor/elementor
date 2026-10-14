import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { type IMcpRegistrationAdapter } from '../adapters/types';
import { createSimpleResourceHandler } from './create-simple-resource-handler';

type OnResourceRegistered = ( ...args: Parameters< IMcpRegistrationAdapter[ 'onResourceRegistered' ] > ) => void;

export const registerServerDocsResource = (
	server: McpServer,
	namespace: string,
	title: string,
	docs: string,
	onRegistered: OnResourceRegistered
): void => {
	const uri = `elementor://${ namespace }/server-docs`;
	const name = `${ namespace }-server-docs`;
	const handler = createSimpleResourceHandler( docs );
	server.registerResource(
		name,
		uri,
		{
			title: `${ title } server docs`,
			description: 'Full MCP documentation (lazy-loaded)',
			mimeType: 'text/plain',
		},
		handler
	);
	onRegistered( name, uri, handler );
};

import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { type IMcpRegistrationAdapter } from '../adapters/types';
import { createSimpleResourceHandler } from './create-simple-resource-handler';

type OnResourceRegistered = ( ...args: Parameters< IMcpRegistrationAdapter[ 'onResourceRegistered' ] > ) => void;

export const registerServerDescriptionResource = (
	server: McpServer,
	namespace: string,
	title: string,
	instructions: string,
	onRegistered: OnResourceRegistered
): void => {
	const uri = `elementor://${ namespace }/server-description`;
	const name = `${ namespace }-server-description`;
	const handler = createSimpleResourceHandler( instructions );
	server.registerResource(
		name,
		uri,
		{
			title: `${ title } Server Description`,
			description: 'Server capabilities and instructions',
			mimeType: 'text/plain',
		},
		handler
	);
	onRegistered( name, uri, handler );
};

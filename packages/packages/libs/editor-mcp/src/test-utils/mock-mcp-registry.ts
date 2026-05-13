import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { type MCPRegistryEntry } from '../mcp-registry';

const mock = new Proxy(
	{},
	{
		get: () => {
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			function mockedFn( ..._: unknown[] ) {}
			return mockedFn;
		},
	}
);

export const mockMcpRegistry = (): MCPRegistryEntry => {
	return {
		// @ts-ignore
		resource: async () => {},
		// @ts-ignore
		sendResourceUpdated: () => {},
		addTool: () => {},
		setMCPDescription: () => {},
		mcpServer: mock as McpServer,
	};
};

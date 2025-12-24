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
		getActiveChatInfo() {
			return { sessionId: 'mock-session-id', expiresAt: Date.now() + 3600000 };
		},
		mcpServer: mock as McpServer,
	};
};

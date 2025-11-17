import { type MCPRegistryEntry } from '../mcp-registry';

export const mockMcpRegistry = (): MCPRegistryEntry => {
	return {
		addTool: () => {},
		setMCPDescription: () => {},
		getActiveChatInfo() {
			return { sessionId: 'mock-session-id', expiresAt: Date.now() + 3600000 };
		},
	};
};

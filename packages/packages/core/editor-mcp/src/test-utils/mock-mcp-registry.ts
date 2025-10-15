import { type MCPRegistryEntry } from '../mcp-registry';

export const mockMcpRegistry = (): MCPRegistryEntry => {
	return {
		addTool: () => {},
		setMCPDescription: () => {},
	};
};

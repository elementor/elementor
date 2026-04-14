import { registerWebMCPResource, registerWebMCPTool } from '../web-mcp-adapter';
import {
	type IMcpRegistrationAdapter,
	type McpResourceHandler,
	type McpResourceUriOrTemplate,
	type McpToolDescriptor,
} from './types';

export class WebMCPAdapter implements IMcpRegistrationAdapter {
	isAvailable(): boolean {
		// Always participate — registerWebMCPTool buffers registrations internally
		// and checks navigator.modelContext availability at DOMContentLoaded flush time.
		return true;
	}

	activate(): void {
		// WebMCP flushes pending registrations automatically on DOMContentLoaded.
	}

	onToolRegistered( tool: McpToolDescriptor ): void {
		registerWebMCPTool( tool );
	}

	onResourceRegistered( name: string, uriOrTemplate: McpResourceUriOrTemplate, handler: McpResourceHandler ): void {
		registerWebMCPResource( name, uriOrTemplate, handler );
	}

	sendResourceUpdated(): void {
		// WebMCP has no server-push mechanism — no-op
	}
}

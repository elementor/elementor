import { toMCPTitle } from '../mcp-registry';
import { getRegisteredMcpServers } from '../mcp-registry';
import { getSDK } from '../utils/get-sdk';
import { isAngieAvailable } from '../utils/is-angie-available';
import { type IMcpRegistrationAdapter, type McpToolDescriptor, type McpResourceUriOrTemplate, type McpResourceHandler } from './types';

const MAX_RETRIES = 3;

export class AngieMcpAdapter implements IMcpRegistrationAdapter {
	isAvailable(): boolean {
		return isAngieAvailable();
	}

	async activate(): Promise< void > {
		const entries = getRegisteredMcpServers();
		if ( entries.length === 0 ) {
			return;
		}

		let sdk;
		try {
			sdk = getSDK();
			await sdk.waitForReady();
		} catch {
			return; // Angie SDK not available — exit quietly
		}

		await this.registerEntries( sdk, entries, MAX_RETRIES );
	}

	private async registerEntries(
		sdk: ReturnType< typeof getSDK >,
		entries: ReturnType< typeof getRegisteredMcpServers >,
		retry: number
	): Promise< void > {
		if ( retry === 0 ) {
			/* eslint-disable-next-line no-console */
			console.error( 'Failed to register MCP after 3 retries. failed entries: ', entries.map( ( [ key ] ) => key ) );
			return;
		}

		const failed: typeof entries = [];
		for ( const [ key, mcpServer, description ] of entries ) {
			try {
				await sdk.registerLocalServer( {
					title: toMCPTitle( key ),
					name: `editor-${ key }`,
					server: mcpServer,
					version: '1.0.0',
					description,
				} );
			} catch {
				failed.push( [ key, mcpServer, description ] );
			}
		}

		if ( failed.length > 0 ) {
			return this.registerEntries( sdk, failed, retry - 1 );
		}
	}

	onToolRegistered( _tool: McpToolDescriptor ): void {
		// Angie tools are registered via McpServer (at activate time).
		// The McpServer already holds the tool — no per-tool action needed here.
	}

	onResourceRegistered( _name: string, _uriOrTemplate: McpResourceUriOrTemplate, _handler: McpResourceHandler ): void {
		// Resources are registered on the McpServer instance directly.
	}

	sendResourceUpdated( _params: { uri: string } ): void {
		// Resource update notifications are sent via the per-namespace McpServer instance,
		// which is managed in MCPRegistryEntry.sendResourceUpdated.
	}
}

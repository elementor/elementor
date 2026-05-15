import { type AngieMcpSdk } from '@elementor-external/angie-sdk';

import { getRegisteredMcpServers, toMCPTitle } from '../mcp-registry';
import { type IMcpRegistrationAdapter } from './types';

const MAX_RETRIES = 3;

export class AngieMcpAdapter implements IMcpRegistrationAdapter {
	constructor( private readonly sdk: AngieMcpSdk ) {}

	async activate(): Promise< void > {
		await this.sdk.waitForReady();
		await this.registerEntries( getRegisteredMcpServers(), MAX_RETRIES );
	}

	private async registerEntries(
		entries: ReturnType< typeof getRegisteredMcpServers >,
		retry: number
	): Promise< void > {
		if ( retry === 0 ) {
			/* eslint-disable-next-line no-console */
			console.error(
				'Failed to register MCP after 3 retries. failed entries: ',
				entries.map( ( [ key ] ) => key )
			);
			return;
		}

		const failed: typeof entries = [];
		for ( const [ key, mcpServer, description ] of entries ) {
			try {
				await this.sdk.registerLocalServer( {
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
			return this.registerEntries( failed, retry - 1 );
		}
	}

	onToolRegistered(): void {
		// Angie tools are registered via McpServer (at activate time).
	}

	onResourceRegistered(): void {
		// Resources are registered on the McpServer instance directly.
	}

	sendResourceUpdated(): void {
		// Resource update notifications are sent via MCPRegistryEntry.sendResourceUpdated.
	}
}

import { type APIRequestContext } from '@playwright/test';
import { fetchNonce } from '../../../wp-authentication';

export const DEFAULT_SERVER_ROUTE = 'mcp/mcp-adapter-default-server';

const PROTOCOL_VERSION = '2025-06-18';

export type McpTool = {
	name: string;
	description?: string;
	inputSchema?: Record<string, unknown>;
};

type JsonRpcResponse = {
	error?: unknown;
	result?: {
		tools?: McpTool[];
		nextCursor?: string;
		content?: { text?: string }[];
		isError?: boolean;
		structuredContent?: Record<string, unknown>;
	};
};

export type McpToolResult = {
	isError: boolean;
	text: string;
	data: Record<string, unknown> | null;
};

// Minimal MCP client: JSON-RPC over the site's MCP REST route, authenticated with the worker's cookie session.
export class McpClient {
	private sessionId: string | null = null;
	private protocolVersion = PROTOCOL_VERSION;
	private nextId = 1;

	private constructor(
		private readonly request: APIRequestContext,
		private readonly baseUrl: string,
		private readonly nonce: string,
		private readonly route: string,
	) {}

	static async connect( request: APIRequestContext, baseUrl: string, route = DEFAULT_SERVER_ROUTE ): Promise<McpClient> {
		const nonce = await fetchNonce( request, baseUrl );
		const client = new McpClient( request, baseUrl, nonce, route );

		const init = await client.rpc( 'initialize', {
			protocolVersion: PROTOCOL_VERSION,
			capabilities: {},
			clientInfo: { name: 'elementor-playwright', version: '1.0.0' },
		} );

		client.protocolVersion = ( init?.result as { protocolVersion?: string } | undefined )?.protocolVersion ?? PROTOCOL_VERSION;
		await client.rpc( 'notifications/initialized', {}, true );

		return client;
	}

	async rawRpc( method: string, params: Record<string, unknown> = {}, notification = false ) {
		const headers: Record<string, string> = {
			'X-WP-Nonce': this.nonce,
			'Content-Type': 'application/json',
			Accept: 'application/json, text/event-stream',
		};

		if ( this.sessionId ) {
			headers[ 'Mcp-Session-Id' ] = this.sessionId;
			headers[ 'MCP-Protocol-Version' ] = this.protocolVersion;
		}

		const body: Record<string, unknown> = { jsonrpc: '2.0', method, params };

		if ( ! notification ) {
			body.id = this.nextId++;
		}

		const response = await this.request.post( `${ this.baseUrl }/wp-json/${ this.route }`, { headers, data: body } );
		const sessionId = response.headers()[ 'mcp-session-id' ];

		if ( sessionId ) {
			this.sessionId = sessionId;
		}

		const text = await response.text();

		let json: JsonRpcResponse | null = null;

		if ( text ) {
			try {
				json = JSON.parse( text );
			} catch {
				throw new Error( `MCP response is not JSON (${ response.status() }): ${ text.slice( 0, 200 ) }` );
			}
		}

		return { status: response.status(), json };
	}

	async rpc( method: string, params: Record<string, unknown> = {}, notification = false ) {
		const { status, json } = await this.rawRpc( method, params, notification );

		if ( notification ) {
			return null;
		}

		if ( status >= 400 || ! json || json.error ) {
			throw new Error( `MCP ${ method } failed (${ status }): ${ JSON.stringify( json ) }` );
		}

		return json;
	}

	async listTools(): Promise<McpTool[]> {
		const tools: McpTool[] = [];
		let cursor: string | undefined;

		do {
			const json = await this.rpc( 'tools/list', cursor ? { cursor } : {} );
			tools.push( ...( json?.result?.tools ?? [] ) );
			cursor = json?.result?.nextCursor;
		} while ( cursor );

		return tools;
	}

	async callTool( name: string, args: Record<string, unknown> = {} ): Promise<McpToolResult> {
		const json = await this.rpc( 'tools/call', { name: toToolName( name ), arguments: args } );
		const result = json?.result ?? {};
		const text = ( result.content ?? [] ).map( ( block ) => block.text ?? '' ).join( '\n' );

		return {
			isError: Boolean( result.isError ),
			text,
			data: result.structuredContent ?? parseJson( text ),
		};
	}

	async callToolOrThrow( name: string, args: Record<string, unknown> = {} ): Promise<Record<string, unknown>> {
		const result = await this.callTool( name, args );

		if ( result.isError ) {
			throw new Error( `${ name } returned an error: ${ result.text }` );
		}

		return result.data ?? {};
	}
}

// Ability ids like "elementor/get-system-info" are exposed as "elementor-get-system-info".
export function toToolName( abilityName: string ): string {
	return abilityName.replace( /\//g, '-' );
}

function parseJson( text: string ): Record<string, unknown> | null {
	try {
		return JSON.parse( text );
	} catch {
		return null;
	}
}

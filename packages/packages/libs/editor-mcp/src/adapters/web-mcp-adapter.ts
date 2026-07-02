import { zodToJsonSchema } from 'zod-to-json-schema';
import { z, type z3 } from '@elementor/schema';

import {
	type IMcpRegistrationAdapter,
	type McpResourceHandler,
	type McpResourceUriOrTemplate,
	type McpToolDescriptor,
	type UriTemplate,
} from './types';

type ZodRawShape = z3.ZodRawShape;

export type ModelContext = {
	registerTool: ( tool: McpToolDescriptor ) => void;
	unregisterTool: ( name: string ) => void;
};

type ResourceEntry = {
	pattern: string;
	match: ( uri: string ) => Record< string, string | string[] > | null;
	handler: McpResourceHandler;
};

export class WebMCPAdapter implements IMcpRegistrationAdapter {
	private readonly registeredToolNames = new Set< string >();
	private readonly resourceEntries: ResourceEntry[] = [];
	private activated = false;

	constructor( private readonly ctx: ModelContext ) {}

	activate(): void {
		if ( this.activated ) {
			return;
		}
		this.activated = true;
		this.ctx.registerTool( {
			name: 'editor-resource-getter',
			description:
				'Get an editor resource by URI, or search for available resources by partial URI. Pass a full URI to retrieve content, or a partial string to discover matching patterns.',
			inputSchema: {
				type: 'object',
				properties: {
					uri: {
						type: 'string',
						description:
							'A full resource URI (e.g. elementor://styles/best-practices) or a partial string to search across available resource patterns.',
					},
				},
				required: [ 'uri' ],
			},
			execute: async ( params ) => {
				const query = params.uri as string;
				const entries = this.resourceEntries;

				if ( entries.length === 0 ) {
					return 'No resources are registered yet.';
				}

				// Exact URI match
				for ( const entry of entries ) {
					const variables = entry.match( query );
					if ( variables !== null ) {
						let resourceUrl: URL;
						try {
							resourceUrl = new URL( query );
						} catch {
							return `Invalid URI '${ query }'. Provide a valid resource URI or a partial string to search patterns.`;
						}
						const result = await entry.handler( resourceUrl, variables );
						return result.contents?.[ 0 ]?.text ?? JSON.stringify( result );
					}
				}

				// Partial search fallback
				const matches = entries.map( ( e ) => e.pattern ).filter( ( pattern ) => pattern.includes( query ) );
				if ( matches.length > 0 ) {
					return `Found ${ matches.length } matching resource pattern(s):\n${ matches.join(
						'\n'
					) }\n\nProvide a full URI to retrieve the resource content.`;
				}

				const available = entries.map( ( e ) => e.pattern ).join( '\n' );
				throw new Error( `No resource matched '${ query }'.\n\nAvailable patterns:\n${ available }` );
			},
		} );
	}

	onToolRegistered(
		tool: McpToolDescriptor,
		extraData?: { resources: string[]; requiredResources: string[] }
	): void {
		let jsonSchema: object;
		try {
			jsonSchema = zodToJsonSchema( z.object( tool.inputSchema as ZodRawShape ) );
		} catch {
			jsonSchema = tool.inputSchema;
		}

		if ( this.registeredToolNames.has( tool.name ) ) {
			this.ctx.unregisterTool( tool.name );
		}

		let resourcesDescription = '';
		if ( extraData ) {
			if ( extraData.resources?.length > 0 ) {
				resourcesDescription += `#Resources:\n${ extraData.resources?.join( '\n' ) }\n\n`;
			}
			if ( extraData.requiredResources?.length > 0 ) {
				resourcesDescription += `#Required Resources:\n${ extraData.requiredResources?.join( '\n' ) }\n\n`;
			}
			resourcesDescription += `To read resources, use editor-resource-getter tool.\n\n`;
		}
		this.ctx.registerTool( {
			name: tool.name,
			description: `${ resourcesDescription }${ tool.description }`,
			inputSchema: jsonSchema,
			execute: tool.execute,
		} );
		this.registeredToolNames.add( tool.name );
	}

	onResourceRegistered( _name: string, uriOrTemplate: McpResourceUriOrTemplate, handler: McpResourceHandler ): void {
		if ( typeof uriOrTemplate === 'string' ) {
			this.resourceEntries.push( {
				pattern: uriOrTemplate,
				match: ( uri ) => ( uri === uriOrTemplate ? {} : null ),
				handler,
			} );
		} else {
			const template = uriOrTemplate.uriTemplate as UriTemplate;
			this.resourceEntries.push( {
				pattern: template.toString(),
				match: ( uri ) => template.match( uri ),
				handler,
			} );
		}
	}

	sendResourceUpdated(): void {
		// WebMCP has no server-push mechanism — no-op
	}
}

type WebMCPToolDescriptor = {
	name: string;
	description: string;
	inputSchema: object;
	execute: ( params: Record< string, unknown > ) => Promise< unknown >;
};

type ModelContext = {
	registerTool: ( tool: WebMCPToolDescriptor ) => void;
	unregisterTool: ( name: string ) => void;
};

function getModelContext(): ModelContext | null {
	if ( typeof navigator === 'undefined' ) {
		return null;
	}
	if ( ! ( 'modelContext' in navigator ) ) {
		return null;
	}
	return ( navigator as unknown as { modelContext: ModelContext } ).modelContext;
}

// Map for deduplication — later registrations for the same name overwrite earlier ones
const pendingTools = new Map< string, WebMCPToolDescriptor >();
const registeredToolNames = new Set< string >();
let flushed = false;

function flushPendingTools() {
	flushed = true;
	const ctx = getModelContext();
	if ( ! ctx ) {
		return;
	}
	for ( const tool of pendingTools.values() ) {
		ctx.registerTool( tool );
		registeredToolNames.add( tool.name );
	}
	pendingTools.clear();
}

if ( typeof document !== 'undefined' ) {
	document.addEventListener( 'DOMContentLoaded', flushPendingTools, { once: true } );
} else {
	flushPendingTools();
}

export function registerWebMCPTool( tool: WebMCPToolDescriptor ): void {
	if ( flushed ) {
		const ctx = getModelContext();
		if ( ! ctx ) {
			return;
		}
		if ( registeredToolNames.has( tool.name ) ) {
			ctx.unregisterTool( tool.name );
		}
		ctx.registerTool( tool );
		registeredToolNames.add( tool.name );
		return;
	}
	pendingTools.set( tool.name, tool );
}

export function unregisterWebMCPTool( name: string ): void {
	getModelContext()?.unregisterTool( name );
}

// Duck-typed UriTemplate — matches the shape exposed by ResourceTemplate.uriTemplate
type UriTemplate = {
	toString: () => string;
	match: ( uri: string ) => Record< string, string | string[] > | null;
};

type ResourceHandler = (
	uri: URL,
	variables: Record< string, string | string[] >
) => Promise< { contents: Array< { text?: string } > } >;

type ResourceEntry = {
	pattern: string;
	match: ( uri: string ) => Record< string, string | string[] > | null;
	handler: ResourceHandler;
};

const resourceEntries: ResourceEntry[] = [];

export function registerWebMCPResource(
	_name: string,
	uriOrTemplate: string | { uriTemplate: UriTemplate },
	handler: ResourceHandler
): void {
	const isFirst = resourceEntries.length === 0;

	if ( typeof uriOrTemplate === 'string' ) {
		resourceEntries.push( {
			pattern: uriOrTemplate,
			match: ( uri ) => ( uri === uriOrTemplate ? {} : null ),
			handler,
		} );
	} else {
		const template = uriOrTemplate.uriTemplate;
		resourceEntries.push( {
			pattern: template.toString(),
			match: ( uri ) => template.match( uri ),
			handler,
		} );
	}

	if ( isFirst ) {
		registerWebMCPTool( {
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

				// Exact URI match
				for ( const entry of resourceEntries ) {
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
				const matches = resourceEntries
					.map( ( e ) => e.pattern )
					.filter( ( pattern ) => pattern.includes( query ) );

				if ( matches.length > 0 ) {
					return `Found ${ matches.length } matching resource pattern(s):\n${ matches.join(
						'\n'
					) }\n\nProvide a full URI to retrieve the resource content.`;
				}

				const available = resourceEntries.map( ( e ) => e.pattern ).join( '\n' );
				throw new Error( `No resource matched '${ query }'.\n\nAvailable patterns:\n${ available }` );
			},
		} );
	}
}

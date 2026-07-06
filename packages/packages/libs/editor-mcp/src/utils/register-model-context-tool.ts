import { type McpToolDescriptor } from '../adapters/types';

export type ModelContextRegisterTool = ( tool: McpToolDescriptor ) => void | Promise< void >;

export type ModelContextUnregisterTool = ( name: string ) => void;

export async function registerModelContextTool(
	registerTool: ModelContextRegisterTool,
	tool: McpToolDescriptor
): Promise< void > {
	try {
		await Promise.resolve( registerTool( tool ) );
	} catch ( error ) {
		/* eslint-disable-next-line no-console */
		console.error( 'Tool registration failed:', error );
	}
}

export function unregisterModelContextTool(
	unregisterTool: ModelContextUnregisterTool | undefined,
	name: string
): void {
	unregisterTool?.( name );
}

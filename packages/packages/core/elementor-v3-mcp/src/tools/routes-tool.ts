import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { McpToolResult, ToolParams } from '../types';

export function addRoutesTool( server: McpServer ): void {
	const routes = window.$e?.routes?.getAll?.() || [];
	const components = window.$e?.components?.getAll?.() || [];
	const availableToOpenComponents = components.filter(
		( component ) => window.$e?.components?.get( component )?.getCommands?.()?.open
	);
	const availableToCloseComponents = components.filter(
		( component ) => window.$e?.components?.get( component )?.getCommands?.()?.close
	);

	server.registerTool(
		'routes',
		{
			description:
				'Manage Elementor editor routing and navigation. Use this tool to open a component, navigate to a route, go back from a route or close components. Always prefer this tool when user is on the Elementor editor.' +
				` Available routes to navigate to or back from: ${ routes.join( ', ' ) }`,
			inputSchema: {
				action: z.enum( [ 'open', 'navigate', 'go-back', 'close' ] ),
				route: z
					.string()
					.optional()
					.describe(
						'The route to navigate to or back from it. Do not send this parameter if you only want to open a component.'
					),
				componentToOpen: z
					.enum( ( availableToOpenComponents.length ? availableToOpenComponents : [ '' ] ) as [ string ] )
					.optional()
					.describe( 'The component to open or navigate to.' ),
				componentToClose: z
					.enum( ( availableToCloseComponents.length ? availableToCloseComponents : [ '' ] ) as [ string ] )
					.optional()
					.describe( 'The component to close.' ),
			},
			annotations: {
				title: 'Manage Routes',
			},
		},
		async ( params: ToolParams ) => {
			switch ( params.action ) {
				case 'open':
					return await handleOpen( params );
				case 'navigate':
					return await handleNavigate( params );
				case 'go-back':
					return await handleGoBack( params );
				case 'close':
					return await handleClose( params );
				default:
					throw new Error( `Unknown action: ${ params.action }` );
			}
		}
	);
}

async function handleOpen( params: ToolParams ): Promise< McpToolResult > {
	const component = ( params.componentToOpen || params.route ) as string;
	const openCommand = window.$e?.components?.get( component )?.getCommands?.()?.open?.registerConfig.command;

	if ( openCommand ) {
		await window.$e?.run( openCommand, {} );
	} else {
		throw new Error( 'Could not open component' );
	}

	return {
		content: [ { type: 'text', text: `Opened: ${ component }` } ],
	};
}

async function handleNavigate( params: ToolParams ): Promise< McpToolResult > {
	const route = params.route as string;
	const componentToOpen = params.componentToOpen as string;
	const openCommand = window.$e?.components?.get( componentToOpen )?.getCommands?.()?.open?.registerConfig.command;

	if ( openCommand ) {
		await window.$e?.run( openCommand, {} );
	}

	const routeComponent = window.$e?.routes?.getComponent?.( route );
	if ( routeComponent ) {
		window.$e?.routes?.saveState?.( routeComponent.getNamespace() );
	}

	try {
		window.$e?.routes?.to?.( route, {} );
	} catch {
		const openCommandFallback = window.$e?.components?.get( route )?.getCommands?.()?.open?.registerConfig.command;

		if ( openCommandFallback ) {
			await window.$e?.run( openCommandFallback, {} );
		} else {
			throw new Error( 'Could not navigate to route' );
		}
	}

	return {
		content: [ { type: 'text', text: `Navigated to: ${ route }` } ],
	};
}

async function handleGoBack( params: ToolParams ): Promise< McpToolResult > {
	const route = params.route as string;
	const component = window.$e?.routes?.getComponent?.( route );

	if ( component ) {
		window.$e?.routes?.back?.( component.getNamespace() );
	}

	return {
		content: [ { type: 'text', text: `Go back to: ${ route }` } ],
	};
}

async function handleClose( params: ToolParams ): Promise< McpToolResult > {
	const component = params.componentToClose as string;
	const closeCommand = window.$e?.components?.get( component )?.getCommands?.()?.close?.registerConfig.command;

	if ( closeCommand ) {
		await window.$e?.run( closeCommand, {} );
	} else {
		throw new Error( 'Could not close component' );
	}

	return {
		content: [ { type: 'text', text: `Closed: ${ component }` } ],
	};
}

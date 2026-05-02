import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import type { McpToolResult, ToolParams } from '../types';
import { get$e } from '../utils';

export function addRoutesTool( server: McpServer ): void {
	const $e = get$e();
	const routes = $e?.routes?.getAll?.() || [];
	const components = $e?.components?.getAll?.() || [];
	const availableToOpenComponents = components.filter(
		( component: string ) => $e?.components?.get( component )?.getCommands?.()?.open
	);
	const availableToCloseComponents = components.filter(
		( component: string ) => $e?.components?.get( component )?.getCommands?.()?.close
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
	const $e = get$e();
	const component = ( params.componentToOpen || params.route ) as string;
	const openCommand = $e?.components?.get( component )?.getCommands?.()?.open?.registerConfig.command;

	if ( openCommand ) {
		await $e?.run( openCommand, {} );
	} else {
		throw new Error( 'Could not open component' );
	}

	return {
		content: [ { type: 'text', text: `Opened: ${ component }` } ],
	};
}

async function handleNavigate( params: ToolParams ): Promise< McpToolResult > {
	const $e = get$e();
	const route = params.route as string;
	const componentToOpen = params.componentToOpen as string;
	const openCommand = $e?.components?.get( componentToOpen )?.getCommands?.()?.open?.registerConfig.command;

	if ( openCommand ) {
		await $e?.run( openCommand, {} );
	}

	const routeComponent = $e?.routes?.getComponent?.( route );
	if ( routeComponent ) {
		$e?.routes?.saveState?.( routeComponent.getNamespace() );
	}

	try {
		$e?.routes?.to?.( route, {} );
	} catch {
		const openCommandFallback = $e?.components?.get( route )?.getCommands?.()?.open?.registerConfig.command;

		if ( openCommandFallback ) {
			await $e?.run( openCommandFallback, {} );
		} else {
			throw new Error( 'Could not navigate to route' );
		}
	}

	return {
		content: [ { type: 'text', text: `Navigated to: ${ route }` } ],
	};
}

async function handleGoBack( params: ToolParams ): Promise< McpToolResult > {
	const $e = get$e();
	const route = params.route as string;
	const component = $e?.routes?.getComponent?.( route );

	if ( component ) {
		$e?.routes?.back?.( component.getNamespace() );
	}

	return {
		content: [ { type: 'text', text: `Go back to: ${ route }` } ],
	};
}

async function handleClose( params: ToolParams ): Promise< McpToolResult > {
	const $e = get$e();
	const component = params.componentToClose as string;
	const closeCommand = $e?.components?.get( component )?.getCommands?.()?.close?.registerConfig.command;

	if ( closeCommand ) {
		await $e?.run( closeCommand, {} );
	} else {
		throw new Error( 'Could not close component' );
	}

	return {
		content: [ { type: 'text', text: `Closed: ${ component }` } ],
	};
}

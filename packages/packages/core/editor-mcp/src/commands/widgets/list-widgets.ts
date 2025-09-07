import { z } from 'zod';

import { type addTool as _addTool } from '../../init';
import initGetWidgetSchemaCommand from './get-widget-schema';

export default function initWidgetsCommands( addTool: typeof _addTool ) {
	// Register list-widgets command
	addTool( {
		name: 'list-widgets',
		outputSchema: z.any(),
		description:
			'List all widgets (or types of elements) from the widgets library that are available to be added to a page',
		handler: async () => {
			return (
				// @ts-expect-error: elementor is not typed
				Object.values( window.elementor.config.widgets || {} )
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.filter( ( widget: any ) => !! widget.atomic_props_schema )
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					.map( ( widget: any ) => ( {
						name: z.string().describe( 'The unique name of the widget' ).parse( widget.name ),
						title: z
							.string()
							.describe( 'The human-friendly display name of the widget' )
							.parse( widget.title ),
						atomicPropsSchema: z
							.object( widget.atomic_props_schema )
							.parse( widget.atomic_props_schema )
							.describe( 'The configuration / properties schema of the widget' ),
					} ) )
			);
		},
	} );

	// Register get-widget-schema command
	initGetWidgetSchemaCommand( addTool );
}

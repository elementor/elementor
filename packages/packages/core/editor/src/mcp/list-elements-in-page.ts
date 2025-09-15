import { getElements } from '@elementor/editor-elements';
import { getByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

export const initListElementsInPageTool = () => {
	getByDomain( 'root' ).addTool( {
		name: 'list-elements-in-page',
		description: 'List all elements in the current page',
		outputSchema: {
			widgets: z
				.object( {
					count: z.number().describe( 'Number of widgets found in the page' ),
					types: z.array( z.string() ).describe( 'Types of widgets found in the page' ),
				} )
				.describe( 'List of widgets found in the page' ),
			containers: z.object( {
				count: z.number().describe( 'Number of containers found in the page' ),
			} ),
		},
		handler: async () => {
			const elements = getElements();
			const widgets = elements.filter( ( element ) => element.model.get( 'elType' ) === 'widget' );
			const containers = elements.filter( ( element ) => element.model.get( 'elType' ) === 'container' );

			return {
				containers: {
					count: containers.length,
				},
				widgets: {
					count: widgets.length,
					types: [
						...new Set( widgets.map( ( widget ) => widget.model.get( 'widgetType' ) || 'unknwon widget' ) ),
					],
				},
			};
		},
	} );
};

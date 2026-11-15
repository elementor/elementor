import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { handleV3LayoutInsertTool, type V3LayoutInsertParams } from './handler';

const elementModelSchema = z
	.object( {
		elType: z.string(),
		widgetType: z.string().optional(),
		id: z.string().optional(),
		settings: z.record( z.unknown() ).optional(),
		elements: z.array( z.record( z.unknown() ) ).optional(),
	} )
	.describe( 'Elementor V3 element model (section, column, container, or widget).' );

export const initV3LayoutInsertTool = ( reg: MCPRegistryEntry ): void => {
	const { addTool } = reg;

	addTool( {
		name: 'v3-layout-insert',
		description:
			'Insert one or more V3 Elementor layout elements (containers/widgets JSON) at a canvas position. Rejects atomic and unknown types. One undo step.',
		schema: {
			parentContainerId: z
				.string()
				.optional()
				.describe( 'Parent container id. Defaults to the document preview root.' ),
			at: z.number().optional().describe( 'Child index under the parent container.' ),
			elements: z
				.union( [ elementModelSchema, z.array( elementModelSchema ) ] )
				.describe( 'Single element model or array of models to insert.' ),
			replaceElementId: z
				.string()
				.optional()
				.describe( 'When set, deletes this element before inserting (variation replace).' ),
			historyTitle: z.string().optional().describe( 'Undo history label.' ),
		},
		outputSchema: {
			success: z.boolean(),
			parentContainerId: z.string(),
			insertedElementIds: z.array( z.string() ),
			at: z.number(),
		},
		isDestructive: true,
		handler: async ( args ) => handleV3LayoutInsertTool( args as V3LayoutInsertParams ),
	} );
};

import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { handleMotionEffectsTool } from './handler';

export const initV3MotionEffectsTool = ( reg: MCPRegistryEntry ): void => {
	const { addTool } = reg;

	addTool( {
		name: 'v3-motion-effects',
		description:
			'Read, set, or clear V3 motion effect settings (entrance or hover) on one non-atomic element. Rejects atomic elements and Pro motion_fx keys without Pro.',
		schema: {
			action: z
				.enum( [ 'get', 'set', 'clear' ] )
				.describe( 'get returns scoped motion settings; set writes settings (one undo step); clear resets scoped settings.' ),
			elementId: z.string().describe( 'Element ID that owns the motion settings.' ),
			scope: z
				.enum( [ 'entrance', 'hover' ] )
				.optional()
				.describe( 'Motion scope: entrance (section_effects) or hover (_tab_positioning_hover). Required for clear.' ),
			settings: z
				.record( z.unknown() )
				.optional()
				.describe( 'Settings keyed by control name. Required for set.' ),
		},
		outputSchema: {
			success: z.boolean().optional(),
			elementId: z.string(),
			scope: z.enum( [ 'entrance', 'hover' ] ),
			widgetType: z.string(),
			settings: z.record( z.unknown() ),
		},
		isDestructive: true,
		handler: handleMotionEffectsTool,
	} );
};

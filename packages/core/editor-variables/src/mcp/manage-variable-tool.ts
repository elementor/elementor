import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';
import { GLOBAL_VARIABLES_URI } from './variables-resource';

export const initManageVariableTool = () => {
	getMCPByDomain( 'variables' ).addTool( {
		name: 'manage-global-variable',
		schema: {
			action: z.enum( [ 'create', 'update', 'delete' ] ).describe( 'Operation to perform' ),
			id: z
				.string()
				.optional()
				.describe( 'Variable id (required for update/delete). Get from list-global-variables.' ),
			type: z
				.string()
				.optional()
				.describe( 'Variable type: "global-color-variable" or "global-font-variable" (required for create)' ),
			label: z.string().optional().describe( 'Variable label (required for create/update)' ),
			value: z.string().optional().describe( 'Variable value (required for create/update)' ),
		},
		outputSchema: {
			status: z.enum( [ 'ok' ] ).describe( 'Operation status' ),
			message: z.string().optional().describe( 'Error details if status is error' ),
		},
		modelPreferences: {
			intelligencePriority: 0.75,
			speedPriority: 0.75,
		},
		requiredResources: [
			{
				uri: GLOBAL_VARIABLES_URI,
				description: 'Global variables',
			},
		],
		description: `Manages global variables (create/update/delete). Existing variables available in resources.
CREATE: requires type, label, value. Ensure label is unique.
UPDATE: requires id, label, value. When renaming: keep existing value. When updating value: keep exact label.
DELETE: requires id. DESTRUCTIVE - confirm with user first.

# NAMING - IMPORTANT
the variables names should ALWAYS be lowercased and dashed spaced. example: "Headline Primary" should be "headline-primary"
`,
		handler: async ( params ) => {
			const operations = getServiceActions( service );
			const op = operations[ params.action ];
			if ( op ) {
				await op( params );
				return {
					status: 'ok',
				};
			}
			throw new Error( `Unknown action ${ params.action }` );
		},
		isDestructive: true, // Because delete is destructive
	} );
};

type Opts< T extends Record< string, string > > = Partial< T > & {
	[ k: string ]: unknown;
};

function getServiceActions( svc: typeof service ) {
	return {
		create( { type, label, value }: Opts< { type: string; label: string; value: string } > ) {
			if ( ! type || ! label || ! value ) {
				throw new Error( 'Create requires type, label, and value' );
			}
			return svc.create( { type, label, value } );
		},
		update( { id, label, value }: Opts< { id: string; label: string; value: string } > ) {
			if ( ! id || ! label || ! value ) {
				throw new Error( 'Update requires id, label, and value' );
			}
			return svc.update( id, { label, value } );
		},
		delete( { id }: Opts< { id: string } > ) {
			if ( ! id ) {
				throw new Error( 'delete requires id' );
			}
			return svc.delete( id );
		},
	};
}

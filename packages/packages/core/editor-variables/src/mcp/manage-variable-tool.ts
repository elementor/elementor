import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';
import { validateLabel } from '../utils/validations';
import { GLOBAL_VARIABLES_URI } from './variables-resource';

export const initManageVariableTool = ( reg: MCPRegistryEntry ) => {
	const { addTool } = reg;
	addTool( {
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
			value: z
				.string()
				.optional()
				.describe(
					'The variable value (required for create/update). Provide a plain CSS value matching the variable type (font: family name; color: CSS color; size: value with unit). Never JSON.'
				),
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
		description: `Create, update, or delete V4 global variables (distinct from legacy "globals").
- Values: any valid CSS value, inserted as-is (1:1 with \`--css-var: VALUE\`). Do NOT pass JSON or legacy-globals object structures.
- Names: lowercase, dash-separated (e.g. "Headline Primary" → "headline-primary").
- Update: when renaming, keep the existing value; when updating value, keep the exact label.
- Delete: destructive — confirm with user first.`,
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
			const labelError = validateLabel( label );
			if ( labelError ) {
				throw new Error( labelError );
			}
			return svc.create( { type, label, value } );
		},
		update( { id, label, value }: Opts< { id: string; label: string; value: string } > ) {
			if ( ! id || ! label || ! value ) {
				throw new Error( 'Update requires id, label, and value' );
			}
			const labelError = validateLabel( label );
			if ( labelError ) {
				throw new Error( labelError );
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

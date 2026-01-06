import { getMCPByDomain } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';

export const initManageVariableTool = () => {
	getMCPByDomain( 'canvas' ).addTool( {
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
			status: z.enum( [ 'ok', 'error' ] ).describe( 'Operation status' ),
			message: z.string().optional().describe( 'Error details if status is error' ),
		},
		modelPreferences: {
			intelligencePriority: 0.75,
			speedPriority: 0.75,
		},
		description: `Manages global variables (create/update/delete). Use list-global-variables first.
CREATE: requires type, label, value. Ensure label is unique.
UPDATE: requires id, label, value. When renaming: keep existing value. When updating value: keep exact label.
DELETE: requires id. DESTRUCTIVE - confirm with user first.`,
		handler: async ( params ) => {
			const { action, id, type, label, value } = params;

			try {
				switch ( action ) {
					case 'create':
						if ( ! type || ! label || ! value ) {
							return {
								status: 'error',
								message: 'Create requires type, label, and value',
							};
						}
						await service.create( { type, label, value } );
						break;

					case 'update':
						if ( ! id || ! label || ! value ) {
							return {
								status: 'error',
								message: 'Update requires id, label, and value',
							};
						}
						await service.update( id, { label, value } );
						break;

					case 'delete':
						if ( ! id ) {
							return {
								status: 'error',
								message: 'Delete requires id',
							};
						}
						await service.delete( id );
						break;
				}

				return { status: 'ok' };
			} catch ( error ) {
				const message: string = ( error as Error ).message || 'Unknown server error';
				return {
					status: 'error',
					message: `${ action } failed: ${ message }`,
				};
			}
		},
		isDestrcutive: true, // Because delete is destructive
	} );
};

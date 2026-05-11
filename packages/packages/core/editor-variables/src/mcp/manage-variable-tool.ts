import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';

import { service } from '../service';
import { validateLabel } from '../utils/validations';
import { GLOBAL_VARIABLES_URI } from './variables-resource';

const VARIABLE_TYPES = {
	COLOR: 'global-color-variable',
	FONT: 'global-font-variable',
	SIZE: 'global-size-variable',
} as const;

type VariableType = ( typeof VARIABLE_TYPES )[ keyof typeof VARIABLE_TYPES ];

const VARIABLE_TYPE_FORMATS: Record< VariableType, { example: string; description: string } > = {
	[ VARIABLE_TYPES.COLOR ]: {
		example: '#FF0000',
		description: 'A CSS color value (hex, rgba, hsl). Example: "#FF0000" or "rgba(255,0,0,1)"',
	},
	[ VARIABLE_TYPES.FONT ]: {
		example: 'Roboto',
		description:
			'A font FAMILY name only — NOT a size or px value. Example: "Roboto" or "Open Sans". NEVER pass pixel or rem values here.',
	},
	[ VARIABLE_TYPES.SIZE ]: {
		example: '16px',
		description: 'A CSS size/spacing value with a unit. Example: "16px" or "1.5rem"',
	},
};

const PX_OR_REM_PATTERN = /^\d+(\.\d+)?(px|rem|em|vh|vw|%)$/i;
const HEX_OR_RGB_PATTERN = /^(#[0-9a-f]{3,8}|rgba?\(|hsl)/i;

function validateValueForType( type: string, value: string ): string {
	if ( type === VARIABLE_TYPES.FONT && PX_OR_REM_PATTERN.test( value.trim() ) ) {
		return `Font variable value must be a font family name (e.g. "Roboto"), not a size value like "${ value }". Use "global-size-variable" for spacing/size values.`;
	}

	if ( type === VARIABLE_TYPES.COLOR && ! HEX_OR_RGB_PATTERN.test( value.trim() ) ) {
		return `Color variable value should be a CSS color (e.g. "#FF0000"), got "${ value }".`;
	}

	if ( type === VARIABLE_TYPES.SIZE && ! PX_OR_REM_PATTERN.test( value.trim() ) ) {
		return `Size variable value should include a CSS unit (e.g. "16px"), got "${ value }".`;
	}

	return '';
}

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
				.describe(
					`Variable type (required for create). Must be one of:
- "global-color-variable" — for colors. Value must be a CSS color e.g. "${ VARIABLE_TYPE_FORMATS[ VARIABLE_TYPES.COLOR ].example }"
- "global-font-variable" — for font FAMILIES only (NOT font sizes). Value must be a font family name e.g. "${ VARIABLE_TYPE_FORMATS[ VARIABLE_TYPES.FONT ].example }"
- "global-size-variable" — for spacing, sizing, or any px/rem values. Value must include a unit e.g. "${ VARIABLE_TYPE_FORMATS[ VARIABLE_TYPES.SIZE ].example }"

IMPORTANT: Never store px/rem values in a "global-font-variable". Use "global-size-variable" instead.`
				),
			label: z.string().optional().describe( 'Variable label (required for create/update)' ),
			value: z
				.string()
				.optional()
				.describe(
					`Variable value (required for create/update). Provide a plain CSS value matching the variable type (font: family name; color: CSS color; size: value with unit). Never JSON. Format depends on type:
- global-color-variable: ${ VARIABLE_TYPE_FORMATS[ VARIABLE_TYPES.COLOR ].description }
- global-font-variable: ${ VARIABLE_TYPE_FORMATS[ VARIABLE_TYPES.FONT ].description }
- global-size-variable: ${ VARIABLE_TYPE_FORMATS[ VARIABLE_TYPES.SIZE ].description }`
				),
		},
		outputSchema: {
			status: z.enum( [ 'ok' ] ).describe( 'Operation status' ),
			message: z.string().optional().describe( 'Error details if status is error' ),
		},
		requiredResources: [
			{
				uri: GLOBAL_VARIABLES_URI,
				description: 'Global variables',
			},
		],
		description: `Manages global variables (create/update/delete). Existing variables available in resources.
CREATE: requires type, label, value. Ensure label is unique. Match the type to the kind of value:
  - Colors → global-color-variable (hex, rgba)
  - Font families → global-font-variable (e.g. "Roboto") — NEVER put px/rem values here
  - Sizes/spacing → global-size-variable (e.g. "16px")
UPDATE: requires id, label, value. When renaming: keep existing value. When updating value: keep exact label.
DELETE: requires id. DESTRUCTIVE - confirm with user first.

# NAMING - IMPORTANT
the variables names should ALWAYS be lowercased and dashed spaced. example: "Headline Primary" should be "headline-primary"
`,
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
			const valueError = validateValueForType( type, value );
			if ( valueError ) {
				throw new Error( valueError );
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
			const existingVariable = svc.variables()[ id ];
			if ( existingVariable ) {
				const valueError = validateValueForType( existingVariable.type, value );
				if ( valueError ) {
					throw new Error( valueError );
				}
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

import { type MCPRegistryEntry } from '@elementor/editor-mcp';
import { z } from '@elementor/schema';
import { isProActive } from '@elementor/utils';

import { service } from '../service';
import { getFontConfigs } from '../sync/get-font-configs';
import { validateLabel } from '../utils/validations';
import { generateVariablesPrompt, MANAGE_VARIABLES_GUIDE_URI } from './variable-tool-prompt';
import { GLOBAL_VARIABLES_URI } from './variables-resource';

const VARIABLE_TYPES = {
	COLOR: 'global-color-variable',
	FONT: 'global-font-variable',
	SIZE: 'global-size-variable',
	CUSTOM_SIZE: 'global-custom-size-variable',
} as const;

const LENGTH_UNIT_PATTERN = /^(auto|\d+(\.\d+)?(px|rem|em|vh|vw|%|ch|s|ms))$/i;
const COLOR_PATTERN = /^(#[0-9a-f]{3,8}|rgba?\(|hsl)/i;

function validateValueForType( type: string, value: string ): string | null {
	if ( type === VARIABLE_TYPES.FONT && LENGTH_UNIT_PATTERN.test( value.trim() ) ) {
		return `Font variable value must be a font family name (e.g. "Roboto"), not a size value like "${ value }". Use "global-size-variable" or "global-custom-size-variable" for spacing/size values.`;
	}

	if ( type === VARIABLE_TYPES.COLOR && ! COLOR_PATTERN.test( value.trim() ) ) {
		return `Color variable value should be a CSS color (e.g. "#FF0000"), got "${ value }".`;
	}

	if ( type === VARIABLE_TYPES.SIZE && ! LENGTH_UNIT_PATTERN.test( value.trim() ) ) {
		return `Size variable value should include a CSS unit (e.g. "16px") or be "auto", got "${ value }".`;
	}

	if ( type === VARIABLE_TYPES.FONT && ! isFontAvailable( value ) ) {
		return `Font "${ value }" is not supported in WordPress. Please choose one of the available font families.`;
	}

	return null;
}

function isFontAvailable( font: string ) {
	const fonts = getFontConfigs();
	const key = font.trim();

	return !! fonts?.[ key ];
}

export const initManageVariableTool = ( reg: MCPRegistryEntry ) => {
	const { addTool, resource } = reg;
	const RUNTIME_ALLOWED_VARIABLE_TYPES = isProActive()
		? ( [ VARIABLE_TYPES.COLOR, VARIABLE_TYPES.FONT, VARIABLE_TYPES.SIZE, VARIABLE_TYPES.CUSTOM_SIZE ] as const )
		: ( [ VARIABLE_TYPES.COLOR, VARIABLE_TYPES.FONT ] as const );

	resource(
		'manage-global-variable-guide',
		MANAGE_VARIABLES_GUIDE_URI,
		{
			title: 'Manage Global Variable Guide',
			description: 'Detailed guide for using the manage-global-variable tool',
			mimeType: 'text/plain',
		},
		async ( uri: URL ) => ( {
			contents: [ { uri: uri.href, mimeType: 'text/plain', text: generateVariablesPrompt() } ],
		} )
	);

	addTool( {
		name: 'manage-global-variable',
		description:
			'Manage V4 global variables (color, font, size, custom-size). Read the guide resource before use. font = font-famliy, size = measured unit, custom-size = calculated values',
		schema: {
			action: z.enum( [ 'create', 'update', 'delete' ] ),
			id: z
				.string()
				.optional()
				.describe( 'Variable id — required for update/delete. Get from the global-variables resource.' ),
			type: z.enum( RUNTIME_ALLOWED_VARIABLE_TYPES ),
			label: z.string().describe( 'Variable label (lowercase, dash-separated) — required for create/update.' ),
			value: z
				.string()
				.optional()
				.describe(
					'Plain CSS value — required for create/update. Color: hex/rgba/hsl. Font: family name only. Size: value with unit e.g. "16px", or "auto" (Pro). Do NOT pass JSON.'
				),
		},
		outputSchema: {
			status: z.enum( [ 'ok' ] ).describe( 'Operation status' ),
			message: z.string().optional().describe( 'Error details if status is error' ),
		},
		requiredResources: [
			{ uri: MANAGE_VARIABLES_GUIDE_URI, description: 'Full guide for variable types, naming rules, and usage' },
			{
				uri: GLOBAL_VARIABLES_URI,
				description: 'Current global variables — check before creating to avoid duplicates',
			},
		],
		isDestructive: true,
		handler: async ( params ) => {
			const operations = getServiceActions( service );
			const op = operations[ params.action ];
			if ( op ) {
				await op( params );
				return { status: 'ok' };
			}
			throw new Error( `Unknown action ${ params.action }` );
		},
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
			if ( ( type === VARIABLE_TYPES.SIZE || type === VARIABLE_TYPES.CUSTOM_SIZE ) && ! isProActive() ) {
				throw new Error( 'Creating size variables requires Elementor Pro.' );
			}
			const labelError = validateLabel( label );
			if ( labelError ) {
				throw new Error( labelError );
			}
			const valueError = validateValueForType( type, value );
			if ( valueError ) {
				throw new Error( valueError );
			}
			return svc.create( { type, label, value }, { eventData: { executedBy: 'mcp_tool' } } );
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
			return svc.update( id, { label, value }, { eventData: { executedBy: 'mcp_tool' } } );
		},
		delete( { id }: Opts< { id: string } > ) {
			if ( ! id ) {
				throw new Error( 'delete requires id' );
			}
			return svc.delete( id );
		},
	};
}

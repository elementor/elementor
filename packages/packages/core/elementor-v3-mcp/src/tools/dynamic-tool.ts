import { z } from '@elementor/schema';
import { type McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

import { V3_DESCRIPTION_URI } from '../mcp-description-resource';
import type { ElementorContainer, McpToolResult, ToolParams } from '../types';
import { get$e, getElementor, getElementorCommon } from '../utils';
import { validateDynamicTagDisabled, validateDynamicTagEnabled } from '../validation-helpers';

export function addDynamicTool( server: McpServer ): void {
	server.registerTool(
		'dynamic',
		{
			description:
				'Manage dynamic-tags content for Elementor elements including getting dynamic settings, enabling and disabling dynamic tags.',
			inputSchema: {
				action: z
					.enum( [ 'get-settings', 'enable', 'disable' ] )
					.describe( 'The dynamic content operation to perform' ),
				elementId: z.string().describe( 'The ID of the element to modify' ),
				controlName: z.string().describe( 'The name of the control/setting to make dynamic' ),
				dynamicName: z
					.string()
					.optional()
					.describe(
						'The name of the dynamic tag to enable. Required for enable action. Output of get-settings action.'
					),
				settings: z
					.object( {} )
					.catchall( z.unknown() )
					.optional()
					.describe(
						'The settings to apply to the dynamic tag. Used with enable action. Output of get-settings action.'
					),
				hasRunGetDynamicSettings: z
					.boolean()
					.optional()
					.describe(
						'Whether the get-settings action has already been run. Must be set to true when using enable action.'
					),
			},
			annotations: {
				title: 'Manage Dynamic Content',
			},
			_meta: {
				'angie/requiredResources': [
					{
						uri: V3_DESCRIPTION_URI,
						whenToUse: 'Read to understand Elementor capabilities and limitations before using this tool.',
					},
				],
			},
		},
		async ( params: ToolParams ) => {
			switch ( params.action ) {
				case 'get-settings':
					return await handleGetDynamicSettings( params );
				case 'enable':
					if ( params.hasRunGetDynamicSettings !== true ) {
						throw new Error(
							'get-dynamic-settings action has not been run. Run it first before using the enable action.'
						);
					}
					if ( ! params.elementId || ! params.controlName || ! params.dynamicName || ! params.settings ) {
						throw new Error(
							'elementId, controlName, dynamicName, and settings are required for dynamic enable'
						);
					}
					return await handleDynamicEnable( params );
				case 'disable':
					if ( ! params.elementId || ! params.controlName ) {
						throw new Error( 'elementId and controlName are required for dynamic disable' );
					}
					return await handleDynamicDisable( params );
				default:
					throw new Error( `Unknown action: ${ params.action }` );
			}
		}
	);
}

async function handleGetDynamicSettings( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.elementId || ! params.controlName ) {
		throw new Error( 'elementId and controlName are required for get-settings' );
	}

	const elementor = getElementor();
	const container = elementor?.getContainer( params.elementId as string );
	if ( ! container ) {
		throw new Error( `Element with ID ${ params.elementId } not found.` );
	}

	const controls = container.settings.controls as Record< string, { dynamic?: { categories?: string[] } } >;
	const control = controls[ params.controlName as string ];

	if ( ! control ) {
		throw new Error( `Control "${ params.controlName }" not found on element ${ params.elementId }.` );
	}

	if ( ! control.dynamic?.categories ) {
		throw new Error( `Control "${ params.controlName }" does not support dynamic content.` );
	}

	const { categories } = control.dynamic;
	const dynamicTags = elementor?.dynamicTags;

	if ( ! dynamicTags?.getConfig ) {
		throw new Error( 'Dynamic tags API is not available.' );
	}

	const tags = dynamicTags.getConfig( 'tags' ) as Record< string, { categories: string[] } >;
	const relevantTags = Object.values( tags ).filter( ( tag ) =>
		tag.categories.find( ( category ) => categories.includes( category ) )
	);

	return {
		content: [ { type: 'text', text: JSON.stringify( relevantTags, null, 2 ) } ],
	};
}

async function handleDynamicEnable( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.elementId || ! params.controlName || ! params.dynamicName ) {
		throw new Error( 'elementId, controlName, and dynamicName are required for dynamic enable' );
	}

	if ( params.hasRunGetDynamicSettings !== true ) {
		throw new Error( 'get-dynamic-settings action has not been run. Run it first before using the enable action.' );
	}

	const elementor = getElementor();
	const container = elementor?.getContainer( params.elementId as string );
	if ( ! container ) {
		throw new Error( `Element with ID ${ params.elementId } not found.` );
	}

	const dynamicName = ( params.dynamicName as string )
		.toLowerCase()
		.replace( /\s+/g, '-' )
		.replace( /_/g, '-' )
		.replace( /[^a-z0-9-]/g, '' );

	const settings = ( params.settings || {} ) as Record< string, unknown > & {
		toJSON?: () => Record< string, unknown >;
	};
	settings.toJSON = () => settings;

	const elementorCommon = getElementorCommon();
	if ( ! elementorCommon?.helpers?.getUniqueId ) {
		throw new Error( 'Elementor Common API is not available.' );
	}

	const uniqueId = elementorCommon.helpers.getUniqueId();

	const dynamicTags = elementor?.dynamicTags;

	if ( ! dynamicTags?.tagDataToTagText ) {
		throw new Error( 'Dynamic tags API is not available.' );
	}

	const tagText = dynamicTags.tagDataToTagText( String( uniqueId ), dynamicName, settings );

	await get$e()?.run( 'document/dynamic/enable', {
		container,
		settings: { [ params.controlName as string ]: tagText },
	} );

	validateDynamicTagEnabled( container, params.controlName as string );

	return {
		content: [
			{
				type: 'text',
				text: `Dynamic content enabled for element ${ params.elementId }, control "${ params.controlName }" with dynamic tag "${ dynamicName }": ${ tagText }`,
			},
		],
	};
}

async function handleDynamicDisable( params: ToolParams ): Promise< McpToolResult > {
	if ( ! params.elementId || ! params.controlName ) {
		throw new Error( 'elementId and controlName are required for dynamic disable' );
	}

	const container = getElementor()?.getContainer( params.elementId as string );
	if ( ! container ) {
		throw new Error( `Element with ID ${ params.elementId } not found.` );
	}

	const getElementDynamicSetting = ( elementContainer: ElementorContainer ) => {
		const modelSettings = ( elementContainer.model?.attributes?.settings || {} ) as Record< string, unknown >;

		const dynamicContent: Record< string, unknown > = {};

		Object.keys( modelSettings ).forEach( ( key ) => {
			const value = modelSettings[ key ];
			let dynamicData = null;

			if ( value && typeof value === 'object' && ( value as { __dynamic__?: unknown } ).__dynamic__ ) {
				dynamicData = ( value as { __dynamic__: unknown } ).__dynamic__;
			}

			if ( dynamicData ) {
				dynamicContent[ key ] = dynamicData;
			}
		} );

		return {
			settingsNames: Object.keys(
				( dynamicContent as { attributes?: Record< string, unknown > } ).attributes || {}
			),
			dynamicContent,
		};
	};

	const availableDynamicSettingNames = getElementDynamicSetting( container ).settingsNames;

	if ( ! availableDynamicSettingNames.includes( params.controlName as string ) ) {
		throw new Error(
			`Setting "${ params.controlName }" on element ${
				params.elementId
			} does not have dynamic content enabled. here is the list of dynamic settings available: ${ JSON.stringify(
				availableDynamicSettingNames,
				null,
				2
			) }`
		);
	}

	await get$e()?.run( 'document/dynamic/disable', {
		container,
		settings: {
			[ params.controlName as string ]: '',
		},
	} );

	validateDynamicTagDisabled( container, params.controlName as string );

	return {
		content: [
			{
				type: 'text',
				text: `Dynamic content disabled for setting "${ params.controlName }" on element ${ params.elementId }.`,
			},
		],
	};
}

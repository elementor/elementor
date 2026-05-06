import { getAngieSdk, McpServer, ResourceTemplate } from '@elementor/editor-mcp';
import { callWpApi, requireConfirmationMessage, waitForElementorEditor } from '@elementor/elementor-mcp-common';
import { z } from '@elementor/schema';

import { addKitDescriptionResource, KIT_DESCRIPTION, KIT_DESCRIPTION_URI } from './mcp-description-resource';

const RESOURCE_NAME_KIT_FONTS = 'elementor-kit-fonts';
const RESOURCE_URI_KIT_FONTS = 'elementor://kit/fonts';
const RESOURCE_NAME_KIT_SCHEMA = 'elementor-kit-schema';
const RESOURCE_URI_KIT_SCHEMA_TEMPLATE = 'elementor://kit/schema/{tab}';
const RESOURCE_NAME_KIT_SETTINGS = 'elementor-kit-settings';
const RESOURCE_URI_KIT_SETTINGS = 'elementor://kit/settings';

type KitFontsResponse = {
	fonts: Record< string, unknown >;
};

type KitSchemaResponse = Record< string, unknown >;

const VERSION = '2.0.0';
async function fetchKitFonts() {
	return callWpApi< KitFontsResponse >( `/angie/v1/elementor-kit/fonts`, 'GET' );
}

async function fetchKitSchema() {
	return callWpApi< KitSchemaResponse >( `/angie/v1/elementor-kit/schema`, 'GET' );
}

async function fetchKitSettings() {
	return callWpApi( `/angie/v1/elementor-kit`, 'GET' );
}

type TypographyItem = {
	typography_font_family?: string;
};

async function validateFonts(
	systemTypography: TypographyItem[] | null | undefined,
	customTypography: TypographyItem[] | null | undefined
) {
	const fontsResponse = await fetchKitFonts();
	const availableFonts = Object.keys( fontsResponse.data.fonts || {} );
	const invalidFonts: string[] = [];

	[ systemTypography, customTypography ].forEach( ( typography ) => {
		if ( typography ) {
			typography.forEach( ( item ) => {
				if ( item.typography_font_family && ! availableFonts.includes( item.typography_font_family ) ) {
					invalidFonts.push( item.typography_font_family );
				}
			} );
		}
	} );

	if ( invalidFonts.length > 0 ) {
		return `Please use available fonts only. Invalid fonts: ${ invalidFonts.join(
			', '
		) }. Available fonts: ${ availableFonts.join( ', ' ) }`;
	}

	return '';
}

function sanitizeMediaFields( obj: Record< string, unknown > ): Record< string, unknown > {
	const mediaFields = [ 'site_logo', 'site_icon' ];
	const sanitized = { ...obj };

	for ( const field of mediaFields ) {
		if ( field in sanitized && sanitized[ field ] === '' ) {
			sanitized[ field ] = 0;
		}
	}

	return sanitized;
}

const baseColorSchema = z.object( {
	title: z.string(),
	color: z.string(),
} );

const baseTypographySchema = z
	.object( {
		title: z.string(),
		typography_typography: z.string(),
		typography_font_family: z
			.string()
			.describe(
				'Font family name that must be from the available Elementor fonts list. Use the get-fonts endpoint (/angie/v1/elementor-kit/fonts) to get the complete list of available fonts. Only use fonts that exist in this list to avoid validation errors.'
			),
		typography_font_weight: z.string(),
		typography_font_size: z
			.object( {
				unit: z.string(),
				size: z.number(),
			} )
			.optional(),
		typography_font_size_tablet: z
			.object( {
				unit: z.string(),
				size: z.number(),
			} )
			.optional(),
		typography_font_size_mobile: z
			.object( {
				unit: z.string(),
				size: z.number(),
			} )
			.optional(),
		typography_line_height: z
			.object( {
				unit: z.string(),
				size: z.number(),
			} )
			.optional(),
	} )
	.passthrough();

const systemColorItemSchema = baseColorSchema.extend( {
	_id: z.enum( [ 'primary', 'secondary', 'text', 'accent' ] ),
} );

const systemTypographyItemSchema = baseTypographySchema.extend( {
	_id: z.enum( [ 'primary', 'secondary', 'text', 'accent' ] ),
} );

const customColorItemSchema = baseColorSchema.extend( {
	_id: z.string(),
} );

const customTypographyItemSchema = baseTypographySchema.extend( {
	_id: z.string(),
} );

const systemColorsSchema = z.array( systemColorItemSchema ).length( 4 );
const systemTypographySchema = z.array( systemTypographyItemSchema ).length( 4 );
const customColorsSchema = z.array( customColorItemSchema );
const customTypographySchema = z.array( customTypographyItemSchema );

const generalPatchSchema = z
	.record( z.unknown() )
	.describe(
		'General patch object for any other Elementor kit settings like spacing, buttons, forms, layout settings, etc.'
	);

export async function createElementorKitServer(): Promise< McpServer > {
	await waitForElementorEditor();
	const server = new McpServer(
		{
			name: 'elementor-kit-server',
			version: VERSION,
			title: 'Elementor Kit',
		},
		{
			instructions: 'Manages Elementor global design system: colors, typography, and site identity.',
			capabilities: {
				resources: {
					subscribe: true,
				},
			},
		}
	);

	addKitDescriptionResource( server );

	const getAvailableTabs = async (): Promise< string[] > => {
		const kitSchema = await fetchKitSchema();
		return Object.keys( kitSchema.data || {} );
	};

	server.registerResource(
		RESOURCE_NAME_KIT_FONTS,
		RESOURCE_URI_KIT_FONTS,
		{
			title: 'Elementor Kit Available Fonts',
			description:
				'Complete list of all available font families that can be used in Elementor, including system fonts, Google fonts, and custom uploaded fonts',
		},
		async ( uri ) => {
			const fontsResponse = await fetchKitFonts();
			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: JSON.stringify( fontsResponse, null, 2 ),
					},
				],
			};
		}
	);

	server.registerResource(
		RESOURCE_NAME_KIT_SETTINGS,
		RESOURCE_URI_KIT_SETTINGS,
		{
			title: 'Elementor Kit Current Settings',
			description:
				'Complete current Elementor global kit configuration including all system and custom colors, typography settings, spacing, buttons, forms, and other site-wide design settings',
		},
		async ( uri ) => {
			const currentSettings = await fetchKitSettings();
			return {
				contents: [
					{
						uri: uri.href,
						mimeType: 'application/json',
						text: JSON.stringify( currentSettings, null, 2 ),
					},
				],
			};
		}
	);

	const availableTabs = await getAvailableTabs();

	server.registerResource(
		RESOURCE_NAME_KIT_SCHEMA,
		new ResourceTemplate( RESOURCE_URI_KIT_SCHEMA_TEMPLATE, {
			list: async () => {
				return {
					resources: availableTabs.map( ( tab ) => {
						return {
							uri: `elementor://kit/schema/${ tab }`,
							name: `${ RESOURCE_NAME_KIT_SCHEMA }-${ tab }`,
							title: `Elementor Kit Schema - ${ tab }`,
							description: `Schema definition for Elementor kit ${ tab } settings tab`,
							mimeType: 'application/json',
						};
					} ),
				};
			},
		} ),
		{
			title: 'Elementor Kit Schema',
			description:
				'Complete schema definition for a specific Elementor kit settings tab, showing all available fields, their types, valid values, and configuration options',
		},
		async ( uri, variables ) => {
			const tab = Array.isArray( variables.tab ) ? variables.tab[ 0 ] : variables.tab;

			if ( ! tab ) {
				throw new Error( 'Tab parameter is required' );
			}

			const kitSchema = await fetchKitSchema();
			const tabSchema = kitSchema.data?.[ tab ];

			if ( ! tabSchema ) {
				throw new Error(
					`No schema found for tab '${ tab }'. Available tabs: ${ Object.keys( kitSchema.data ).join(
						', '
					) }`
				);
			}

			return {
				contents: [
					{
						uri: uri.toString(),
						mimeType: 'application/json',
						text: JSON.stringify( tabSchema, null, 2 ),
					},
				],
			};
		}
	);

	server.registerTool(
		'update-elementor-kit-settings-colors-and-fonts',
		{
			description: `This tool applies configuration changes to Elementor global kit settings that control site-wide design elements. Use this when you need to modify global colors, typography, spacing, buttons, form fields, or other theme-wide settings that affect the entire website appearance.

The tool will permanently update the site's global design settings and return a success confirmation with the updated configuration data.`,
			inputSchema: {
				systemColors: systemColorsSchema
					.optional()
					.nullable()
					.describe(
						'System colors array with exactly 4 items having IDs: primary, secondary, text, accent'
					),
				systemTypography: systemTypographySchema
					.optional()
					.nullable()
					.describe(
						'System typography array with exactly 4 items having IDs: primary, secondary, text, accent'
					),
				customColors: customColorsSchema
					.optional()
					.nullable()
					.describe( 'Custom colors array - flexible structure for additional color definitions' ),
				customTypography: customTypographySchema
					.optional()
					.nullable()
					.describe(
						'Custom typography array - flexible structure for additional font definitions (no color field needed)'
					),
				patchObject: generalPatchSchema
					.optional()
					.nullable()
					.describe(
						'General patch object for any other Elementor kit settings like spacing, buttons, forms, layout settings, etc.'
					),
				confirmationMessage: z
					.string()
					.describe(
						'REQUIRED: Provide a clear explanation in **markdown format** of what Elementor kit settings will be changed and their potential impact on the site\'s global design. This message will be shown to the user before proceeding. Be specific about which design elements are being modified (colors, typography, spacing, etc.) and how they will affect the entire website. Examples: "You\'re about to update the global **primary color** from `blue` to `green`. This will change **buttons**, **links**, and **accent colors** throughout your entire site." or "You\'re about to change the **primary font** from `Roboto` to `Open Sans`. This will affect **headings** across all pages."'
					),
			},
			annotations: {
				title: 'Update Elementor Kit Settings',
				destructiveHint: true,
			},
			_meta: {
				'angie/requiredResources': [
					{
						uri: KIT_DESCRIPTION_URI,
						whenToUse: 'Read first for kit capabilities and limitations',
					},
				],
			},
		},
		async ( {
			systemColors,
			systemTypography,
			customColors,
			customTypography,
			patchObject,
			confirmationMessage,
		} ) => {
			requireConfirmationMessage( confirmationMessage, 'Elementor kit settings' );

			const invalidFonts = await validateFonts( systemTypography, customTypography );
			if ( invalidFonts ) {
				throw new Error( invalidFonts );
			}

			const completePatchObject = {
				...( systemColors && { system_colors: systemColors } ),
				...( systemTypography && { system_typography: systemTypography } ),
				...( customColors && { custom_colors: customColors } ),
				...( customTypography && { custom_typography: customTypography } ),
				...sanitizeMediaFields( patchObject || {} ),
			};

			if ( Object.keys( completePatchObject ).length === 0 ) {
				throw new Error(
					'At least one update must be provided (systemColors, systemTypography, customColors, customTypography, or patchObject)'
				);
			}

			const response = await callWpApi( `/angie/v1/elementor-kit`, 'POST', completePatchObject );

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(
							{
								success: true,
								message: 'Settings updated successfully',
								data: response,
								appliedSettings: completePatchObject,
							},
							null,
							2
						),
					},
				],
			};
		}
	);

	const sdk = getAngieSdk();
	await sdk.waitForReady();
	sdk.registerLocalServer( {
		server,
		version: VERSION,
		description: KIT_DESCRIPTION,
		name: 'elementor-kit-server',
	} );
	return server;
}

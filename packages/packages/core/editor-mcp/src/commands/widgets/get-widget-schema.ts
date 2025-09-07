import { z, type ZodType } from 'zod';
import {
	type ArrayPropType,
	type ObjectPropType,
	type PlainPropType,
	type PropsSchema,
	type PropType,
	type UnionPropType,
} from '@elementor/editor-props';

import { type addTool as _addTool } from '../../init';

type Widget = {
	name: string;
	title: string;
	atomic_props_schema?: PropsSchema;
};

function getWidget( widgetName: string ): Widget | null {
	// @ts-expect-error: elementor is not typed
	const widgets = window.elementor?.config?.widgets || {};
	const widget = widgets[ widgetName ];

	if ( ! widget ) {
		return null;
	}

	return {
		name: widget.name,
		title: widget.title,
		atomic_props_schema: widget.atomic_props_schema,
	};
}

function convertPropTypeToZod( propType: PropType ): z.ZodType {
	switch ( propType.kind ) {
		case 'plain':
			return convertPlainPropType( propType );
		case 'array':
			return convertArrayPropType( propType );
		case 'object':
			return convertObjectPropType( propType );
		case 'union':
			return convertUnionPropType( propType );
		default:
			return z.unknown();
	}
}

function convertPlainPropType( propType: PlainPropType ): z.ZodType {
	const { key, default: defaultValue } = propType;

	let zodSchema: z.ZodType;

	switch ( key ) {
		case 'text':
		case 'textarea':
		case 'url':
		case 'color':
		case 'media':
			zodSchema = z.string();
			break;
		case 'number':
		case 'slider':
			zodSchema = z.number();
			break;
		case 'switcher':
		case 'checkbox':
			zodSchema = z.boolean();
			break;
		case 'select':
		case 'choose':
			zodSchema = z.string();
			break;
		default:
			zodSchema = z.unknown();
	}

	if ( defaultValue !== undefined && defaultValue !== null ) {
		zodSchema = zodSchema.default( defaultValue );
	}

	return zodSchema;
}

function convertArrayPropType( propType: ArrayPropType ): z.ZodType {
	const itemSchema = convertPropTypeToZod( propType.item_prop_type );
	let zodSchema = z.array( itemSchema ) as ZodType;

	if ( propType.default !== undefined && propType.default !== null ) {
		zodSchema = zodSchema.default( propType.default );
	}

	return zodSchema;
}

function convertObjectPropType( propType: ObjectPropType ): z.ZodType {
	const shape: Record< string, z.ZodType > = {};

	for ( const [ key, childPropType ] of Object.entries( propType.shape ) ) {
		shape[ key ] = convertPropTypeToZod( childPropType );
	}

	let zodSchema = z.object( shape ) as ZodType;

	if ( propType.default !== undefined && propType.default !== null ) {
		zodSchema = zodSchema.default( propType.default );
	}

	return zodSchema;
}

function convertUnionPropType( propType: UnionPropType ): z.ZodType {
	const schemas = Object.values( propType.prop_types ).map( convertPropTypeToZod );

	if ( schemas.length === 0 ) {
		return z.unknown();
	}

	if ( schemas.length === 1 ) {
		return schemas[ 0 ];
	}

	let zodSchema = z.union( schemas as [ z.ZodType, z.ZodType, ...z.ZodType[] ] ) as ZodType;

	if ( propType.default !== undefined && propType.default !== null ) {
		zodSchema = zodSchema.default( propType.default );
	}

	return zodSchema;
}

function convertPropsSchemaToZod( propsSchema: PropsSchema ): z.ZodObject< Record< string, z.ZodType > > {
	const shape: Record< string, z.ZodType > = {};

	for ( const [ key, propType ] of Object.entries( propsSchema ) ) {
		shape[ key ] = convertPropTypeToZod( propType );
	}

	return z.object( shape );
}

export default function initGetWidgetSchemaCommand( addTool: typeof _addTool ) {
	addTool( {
		name: 'get-widget-schema',
		description: getToolDescription(),
		schema: z.object( {
			widgetName: z.string().describe( 'The name of the widget to get schema for' ),
		} ),
		outputSchema: z.object( {
			widgetName: z.string().describe( 'The unique name of the widget' ),
			widgetTitle: z.string().describe( 'The human-friendly display name of the widget' ),
			configurationSchema: z.any().describe( 'The Zod schema representing the widget configuration properties' ),
		} ),
		handler: async ( { widgetName } ) => {
			const widget = getWidget( widgetName );

			if ( ! widget ) {
				throw new Error( `Widget '${ widgetName }' not found` );
			}

			if ( ! widget.atomic_props_schema ) {
				throw new Error( `Widget '${ widgetName }' does not have an atomic props schema` );
			}

			const zodSchema = convertPropsSchemaToZod( widget.atomic_props_schema );

			return {
				widgetName: widget.name,
				widgetTitle: widget.title,
				configurationSchema: zodSchema.describe( `Zod schema for ${ widget.title } widget properties` ),
			};
		},
	} );
}

function getToolDescription() {
	return `Use this tool to get a widget's configuration schema. This is in order to understand what properties are available for a specific widget and how to configure it.
This Tool is to be used when a user requests information what can be changed or configured for a widget, or actually wants to change or configure a widget.

## When to use this tool
- When a user asks what properties are available for a specific widget.
- When a user wants to know how to configure a specific widget.
- When a user wants to change or set properties for a specific widget, use this tool to retreive the configuration schema before using another tool to make the changes.

## How to use this tool
- Provide the exact name of the widget as it appears in the Elementor widgets library.
- The response will include the widget's name, title, and a detailed Zod schema of its configuration properties.

## Before using this tool
If you do not know if the widget exists, or the name isn't exactly matching what you know, check the list of possible widgets using the "list-widgets" tool first.

## Example
**User Input:**
User: Get the configuration for the "Heading" widget.
- or -
User: What can I change in the "Heading" widget?

**Tool Input:**
{
  "widgetName": "heading"
}
  
**Tool Response:** 
{
  "widgetName": "heading",
  "widgetTitle": "Heading",
  "configurationSchema": {
    // Zod schema representation of the Heading widget's properties
  }
}

This schema will help you understand what properties can be set for the "Heading" widget and how to structure your configuration accordingly.

## Example for getting the schema before changing a widget's property or configuring it
**User Input:**
I want to change the text of the "Heading" widget to "Welcome to My Site".

**Tool Input:**
{
  "widgetName": "heading"
}
  
**Tool Response:**
{
  "widgetName": "heading",
  "widgetTitle": "Heading",
  "configurationSchema": {
    // Zod schema representation of the Heading widget's properties
  }
}

Based on the schema, you can see that the "title" property is available for the "Heading" widget. You can now proceed to change the text property to "Welcome to My Site".
Some widgets have different names for similar properties. For example, the "Paragraph" widget uses "text" instead of "title" for its main text content.
Always refer to the schema to ensure you're using the correct property names as best as you can, ensuring the correct type matches the schema.
`;
}

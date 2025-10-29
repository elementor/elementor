import { getWidgetsCache } from '@elementor/editor-elements';
import { jsonSchemaToZod, Zod as z, zodToJsonSchema } from '@elementor/editor-mcp';
import { getPropSchemaFromCache, type PropType } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { type ZodTypeAny } from '@elementor/schema';

export const getElementSchemaAsZod = ( elementType: string, omitStyles = false ) => {
	const widgetsCache = getWidgetsCache() as NonNullable< ReturnType< typeof getWidgetsCache > >;
	const schema = widgetsCache[ elementType ]?.atomic_props_schema;

	if ( ! schema ) {
		throw new Error( `No configuration schema found for element type: ${ elementType }` );
	}

	const result = extractPropTypes( schema );
	if ( ! omitStyles ) {
		result._styles = z
			.object( buildStyleSchema() )
			.optional()
			.describe( 'Style properties for the element, as they reflect in the final CSS' );
	}
	return {
		zodSchema: result as z.ZodRawShape,
		schema,
	};
};

export const extractPropTypes = ( schema: Record< string, PropType > ) => {
	const result: Record< string, z.ZodTypeAny | ZodTypeAny > = {};
	for ( const [ key, propDef ] of Object.entries( schema ) ) {
		// skip internals
		if ( key === '_cssid' || key === 'classes' || key === 'attributes' ) {
			continue;
		}

		const llmSupport = propDef.meta?.llm;
		const description = propDef.meta?.description || propDef.meta?.llm?.description;

		if ( llmSupport ) {
			if ( llmSupport.schema ) {
				result[ key ] = jsonSchemaToZod( llmSupport.schema ).optional() as unknown as z.ZodTypeAny;
			} else {
				switch ( llmSupport.propType ) {
					case 'number':
						result[ key ] = z.number().optional();
						break;
					case 'boolean':
						result[ key ] = z.boolean().optional();
						break;
					case 'string':
					default:
						result[ key ] = z.string().optional();
						break;
				}
				if ( llmSupport.propType && Array.isArray( propDef.settings?.enum ) ) {
					result[ key ] = z.enum( propDef.settings.enum ).optional();
				}
			}

			if ( description ) {
				result[ key ] = result[ key ].describe( llmSupport.description );
			}
		} else {
			const propType =
				getPropSchemaFromCache( key ) || getPropSchemaFromCache( ( propDef as { key: string } ).key );
			if ( propType ) {
				const { value } = propType.schema.shape;
				// @ts-ignore
				const asJsonSchema = zodToJsonSchema( value );
				result[ key ] = jsonSchemaToZod( asJsonSchema.definitions || {} ).optional() as unknown as z.ZodTypeAny;
			}
		}
	}
	return result;
};

export const buildStyleSchema = () => {
	return extractPropTypes( getStylesSchema() );
};

export const buildPropFromJsonSchema = ( jsonSchema: Record< string, unknown > ) => {
	const result = jsonSchemaToZod( jsonSchema );
	return result;
};

import { getWidgetsCache } from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';
import { getStylesSchema } from '@elementor/editor-styles';
import { z } from '@elementor/schema';

export const getElementSchemaAsZod = ( elementType: string ) => {
	const widgetsCache = getWidgetsCache() as NonNullable< ReturnType< typeof getWidgetsCache > >;
	const schema = widgetsCache[ elementType ]?.atomic_props_schema;

	if ( ! schema ) {
		throw new Error( `No configuration schema found for element type: ${ elementType }` );
	}

	const result = extractPropTypes( schema );
	result._styles = z.object( buildStyleSchema() ).optional().describe( 'Style properties for the element' );
	return {
		zodSchema: result,
		schema,
	};
};

export const extractPropTypes = ( schema: Record< string, PropType > ) => {
	const result: Record< string, z.ZodTypeAny > = {};
	for ( const [ key, propDef ] of Object.entries( schema ) ) {
		// skip internals
		if ( key === '_cssid' || key === 'classes' || key === 'attributes' ) {
			continue;
		}

		const llmSupport = propDef.meta?.llm;

		if ( llmSupport ) {
			switch ( llmSupport.type ) {
				case 'string':
				default:
					result[ key ] = z.string();
					break;
			}

			if ( llmSupport.description ) {
				result[ key ].describe( llmSupport.description );
			}

			result[ key ].optional();
		}
	}
	return result;
};

export const buildStyleSchema = () => {
	const result: Record< string, z.ZodTypeAny > = {};
	const styleSchema = getStylesSchema();

	Object.keys( styleSchema ).forEach( ( stylePropName ) => {
		const propDef = styleSchema[ stylePropName ];
		if ( propDef.meta?.llm ) {
			switch ( propDef.meta.llm.type ) {
				case 'string':
				default:
					result[ stylePropName ] = z.string().optional();
					break;
			}
			if ( propDef.meta.llm.description ) {
				result[ stylePropName ].describe( propDef.meta.llm.description );
			}
		}
	} );

	return result;
};

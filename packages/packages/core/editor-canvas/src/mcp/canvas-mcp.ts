import { type MCPRegistryEntry, zodToJsonSchema } from '@elementor/editor-mcp';
import { getPropSchemaFromCache, type TransformablePropValue } from '@elementor/editor-props';
import { z, type ZodAny, type ZodType } from '@elementor/schema';

import { initBuildHtmlTool } from './build-html/build-html-tool';
import { initConfigureElementTool } from './configure-element-tool';

export const initCanvasMcp = ( reg: MCPRegistryEntry ) => {
	const { setMCPDescription } = reg;

	initBuildHtmlTool( reg );
	initConfigureElementTool( reg );

	setMCPDescription( 'Everything related to creative design, layout and building the pages' );

	reg.addTool( {
		name: 'test',
		description: 'A test tool',
		outputSchema: {
			data: z.any(),
		},
		handler: async () => {
			const heightProp = getPropSchemaFromCache( 'box-shadow' );
			const transformed = heightProp?.schema; // deepTransform( heightProp );
			return { data: zodToJsonSchema( transformed ) };
		},
	} );
};

type AnyPropValue = TransformablePropValue< string, ZodAny >;
type Schema = ZodType< AnyPropValue > | ZodAny;
// function transformPropToZod( propOrZod: Schema | ZodType< PropValue > ) {
// 	if ( '$$type' in propOrZod ) {
// 		const prop = propOrZod as Schema;
// 		return prop.schema.shape.value;
// 	}
// 	return propOrZod;
// }

// function deepTransform( propOrZod: Schema ): ZodAny {
// 	if ( propOrZod._def.typeName === 'ZodObject' ) {
// 		const shape = ( propOrZod._def as any )?.shape;
// 		if ( ! shape ) {
// 			return propOrZod;
// 		}
// 		const newShape: Record< string, ZodAny > = {};
// 	}
// 	if ( '$$type' in propOrZod ) {
// 		const value = propOrZod.value as ZodType;
// 		return deepTransform( value );
// 	}
// 	const asZod = propOrZod as ZodAny;
// 	return { ...propOrZod._def.shape() };

// 	const current = transformPropToZod( propOrZod );
// 	console.log( current );
// 	const shape = ( current as unknown as Record< string, ZodType > ).shape as unknown as Record< string, ZodType >;
// 	if ( ! shape ) {
// 		return current;
// 	}
// 	const newShape: Record< string, ZodType > = {};
// 	Object.keys( shape ).forEach( ( key ) => {
// 		const child = shape[ key ];
// 		const converted = deepTransform( child );
// 		newShape[ key ] = converted;
// 	} );
// 	return z.object( newShape );
// }

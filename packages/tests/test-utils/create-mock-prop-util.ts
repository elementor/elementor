import { createPropUtils, type PropTypeUtil, type PropValue } from '@elementor/editor-props';
import { z, type ZodRawShape, type ZodTypeAny } from '@elementor/schema';

type Params = ZodRawShape;

export const createMockPropUtil = ( key: string, schema: ZodTypeAny ): PropTypeUtil< string, PropValue > => {
	return createPropUtils( key, schema );
};

export const createMockSchema = (
	type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'any',
	params?: Params
) =>
	( {
		string: z.string(),
		number: z.number(),
		boolean: z.boolean(),
		object: params ? z.object( params ) : z.record( z.any() ),
		any: z.any(),
		array: z.array( z.any() ),
	} )[ type ];

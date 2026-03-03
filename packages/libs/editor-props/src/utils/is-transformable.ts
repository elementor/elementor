import { z } from '@elementor/schema';

const transformableSchema = z.object( {
	$$type: z.string(),
	value: z.any(),
	disabled: z.boolean().optional(),
} );

type TransformablePropValue = z.infer< typeof transformableSchema >;

export const isTransformable = ( value: unknown ): value is TransformablePropValue => {
	return transformableSchema.safeParse( value ).success;
};

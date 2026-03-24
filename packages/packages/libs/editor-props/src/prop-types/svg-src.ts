import { z } from '@elementor/schema';

import { type CreateOptions, createPropUtils, type PropTypeUtil } from '../utils/create-prop-utils';
import { imageSrcPropTypeUtil, type ImageSrcPropValue } from './image-src';
import { unknownChildrenSchema } from './utils';

const svgSrcValueSchema = z
	.strictObject( {
		id: unknownChildrenSchema,
		url: z.null(),
	} )
	.or(
		z.strictObject( {
			id: z.null(),
			url: unknownChildrenSchema,
		} )
	)
	.or(
		z.strictObject( {
			id: unknownChildrenSchema,
			url: unknownChildrenSchema,
		} )
	);

export const svgSrcPropTypeUtil = createPropUtils( 'svg-src', svgSrcValueSchema );

export type SvgSrcPropValue = z.infer< typeof svgSrcValueSchema >;

export type SvgMediaPropValue = SvgSrcPropValue | ImageSrcPropValue;

const svgMediaSchema = z.union( [ svgSrcPropTypeUtil.schema, imageSrcPropTypeUtil.schema ] );

/**
 * Union prop type util that reads both `svg-src` and legacy `image-src`,
 * but always writes `svg-src`. Enables gradual data migration on edit.
 */
export const svgMediaPropTypeUtil = {
	key: 'svg-src' as const,
	schema: svgMediaSchema,

	isValid( prop: unknown ) {
		return svgMediaSchema.safeParse( prop ).success;
	},

	extract( prop: unknown ): SvgMediaPropValue | null {
		return svgSrcPropTypeUtil.extract( prop ) ?? imageSrcPropTypeUtil.extract( prop );
	},

	create( value: SvgSrcPropValue, createOptions?: CreateOptions ) {
		const base = createOptions?.base;
		const needsMigration = base && imageSrcPropTypeUtil.isValid( base );

		if ( ! needsMigration ) {
			return svgSrcPropTypeUtil.create( value, createOptions );
		}

		const inner = imageSrcPropTypeUtil.extract( base );

		return svgSrcPropTypeUtil.create( value, {
			...createOptions,
			base: inner ? svgSrcPropTypeUtil.create( inner ) : base,
		} );
	},
} as unknown as PropTypeUtil< 'svg-src', SvgMediaPropValue >;

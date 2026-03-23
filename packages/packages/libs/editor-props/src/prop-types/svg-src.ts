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

export type AtomicSvgMediaPropValue = SvgSrcPropValue | ImageSrcPropValue;

const atomicSvgMediaSchema = z.union( [ svgSrcPropTypeUtil.schema, imageSrcPropTypeUtil.schema ] );

type AtomicSvgMediaPropWrapper = z.infer< typeof atomicSvgMediaSchema >;

function normalizeCreateOptionsBase( createOptions?: CreateOptions ): CreateOptions | undefined {
	if ( ! createOptions?.base ) {
		return createOptions;
	}

	if ( ! imageSrcPropTypeUtil.isValid( createOptions.base ) ) {
		return createOptions;
	}

	const inner = imageSrcPropTypeUtil.extract( createOptions.base );

	return {
		...createOptions,
		base: inner ? svgSrcPropTypeUtil.create( inner ) : createOptions.base,
	};
}

export const atomicSvgMediaPropTypeUtil = {
	key: 'svg-src' as const,
	schema: atomicSvgMediaSchema,
	isValid( prop: unknown ): prop is AtomicSvgMediaPropWrapper {
		return atomicSvgMediaSchema.safeParse( prop ).success;
	},
	extract( prop: unknown ): SvgSrcPropValue | ImageSrcPropValue | null {
		if ( svgSrcPropTypeUtil.isValid( prop ) ) {
			return svgSrcPropTypeUtil.extract( prop );
		}
		if ( imageSrcPropTypeUtil.isValid( prop ) ) {
			return imageSrcPropTypeUtil.extract( prop );
		}
		return null;
	},
	create(
		value: SvgSrcPropValue | ( ( prev?: SvgSrcPropValue ) => SvgSrcPropValue ),
		createOptions?: CreateOptions
	) {
		return svgSrcPropTypeUtil.create(
			value as SvgSrcPropValue & ( ( p?: SvgSrcPropValue ) => SvgSrcPropValue ),
			normalizeCreateOptionsBase( createOptions )
		);
	},
} as unknown as PropTypeUtil< 'svg-src', AtomicSvgMediaPropValue >;

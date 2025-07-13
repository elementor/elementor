import { styleTransformersRegistry } from './style-transformers-registry';
import { imageSrcTransformer } from './transformers/shared/image-src-transformer';
import { imageTransformer } from './transformers/shared/image-transformer';
import { plainTransformer } from './transformers/shared/plain-transformer';
import { backgroundColorOverlayTransformer } from './transformers/styles/background-color-overlay-transformer';
import { backgroundGradientOverlayTransformer } from './transformers/styles/background-gradient-overlay-transformer';
import { backgroundImageOverlayTransformer } from './transformers/styles/background-image-overlay-transformer';
import { backgroundImageSizeScaleTransformer } from './transformers/styles/background-image-size-scale-transformer';
import { backgroundOverlayTransformer } from './transformers/styles/background-overlay-transformer';
import { backgroundTransformer } from './transformers/styles/background-transformer';
import { colorStopTransformer } from './transformers/styles/color-stop-transformer';
import { createCombineArrayTransformer } from './transformers/styles/create-combine-array-transformer';
import { createMultiPropsTransformer } from './transformers/styles/create-multi-props-transformer';
import { filterTransformer } from './transformers/styles/filter-transformer';
import { flexTransformer } from './transformers/styles/flex-transformer';
import { positionTransformer } from './transformers/styles/position-transformer';
import { shadowTransformer } from './transformers/styles/shadow-transformer';
import { sizeTransformer } from './transformers/styles/size-transformer';
import { strokeTransformer } from './transformers/styles/stroke-transformer';
import { transformMoveTransformer } from './transformers/styles/transform-move-transformer';
import { transformRotateTransformer } from './transformers/styles/transform-rotate-transformer';
import { transformScaleTransformer } from './transformers/styles/transform-scale-transformer';
import { transformSkewTransformer } from './transformers/styles/transform-skew-transformer';
import { transformTransformer } from './transformers/styles/transform-transformer';

export function initStyleTransformers() {
	styleTransformersRegistry
		.register( 'size', sizeTransformer )
		.register( 'shadow', shadowTransformer )
		.register( 'stroke', strokeTransformer )
		.register(
			'dimensions',
			createMultiPropsTransformer(
				[ 'block-start', 'block-end', 'inline-start', 'inline-end' ],
				( { propKey, key } ) => `${ propKey }-${ key }`
			)
		)
		.register( 'filter', filterTransformer )
		.register( 'backdrop-filter', filterTransformer )
		.register( 'box-shadow', createCombineArrayTransformer( ',' ) )
		.register( 'background', backgroundTransformer )
		.register( 'background-overlay', backgroundOverlayTransformer )
		.register( 'background-color-overlay', backgroundColorOverlayTransformer )
		.register( 'background-image-overlay', backgroundImageOverlayTransformer )
		.register( 'background-gradient-overlay', backgroundGradientOverlayTransformer )
		.register( 'gradient-color-stop', createCombineArrayTransformer( ',' ) )
		.register( 'color-stop', colorStopTransformer )
		.register( 'background-image-position-offset', positionTransformer )
		.register( 'background-image-size-scale', backgroundImageSizeScaleTransformer )
		.register( 'image-src', imageSrcTransformer )
		.register( 'image', imageTransformer )
		.register( 'object-position', positionTransformer )
		.register( 'transform-move', transformMoveTransformer )
		.register( 'transform-scale', transformScaleTransformer )
		.register( 'transform-rotate', transformRotateTransformer )
		.register( 'transform-skew', transformSkewTransformer )
		.register( 'transform', transformTransformer )
		.register(
			'layout-direction',
			createMultiPropsTransformer( [ 'row', 'column' ], ( { propKey, key } ) => `${ key }-${ propKey }` )
		)
		.register( 'flex', flexTransformer )
		.register(
			'border-width',
			createMultiPropsTransformer(
				[ 'block-start', 'block-end', 'inline-start', 'inline-end' ],
				( { key } ) => `border-${ key }-width`
			)
		)
		.register(
			'border-radius',
			createMultiPropsTransformer(
				[ 'start-start', 'start-end', 'end-start', 'end-end' ],
				( { key } ) => `border-${ key }-radius`
			)
		)
		.registerFallback( plainTransformer );
}

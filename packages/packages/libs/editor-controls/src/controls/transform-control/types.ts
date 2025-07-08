import {
	numberPropTypeUtil,
	rotateTransformPropTypeUtil,
	scaleTransformPropTypeUtil,
	type TransformItemPropValue,
} from '@elementor/editor-props';

export type TransformFunction = 'transform-move' | 'transform-scale' | 'transform-rotate';

export const TransformFunctionKeys: Record< string, TransformFunction > = {
	move: 'transform-move',
	scale: 'transform-scale',
	rotate: 'transform-rotate',
};

export const initialTransformValue: TransformItemPropValue = {
	$$type: TransformFunctionKeys.move,
	value: {
		x: { $$type: 'size', value: { size: 0, unit: 'px' } },
		y: { $$type: 'size', value: { size: 0, unit: 'px' } },
		z: { $$type: 'size', value: { size: 0, unit: 'px' } },
	},
};

export const initialScaleValue = scaleTransformPropTypeUtil.create( {
	x: numberPropTypeUtil.create( 1 ),
	y: numberPropTypeUtil.create( 1 ),
	z: numberPropTypeUtil.create( 1 ),
} );

export const initialRotateValue = rotateTransformPropTypeUtil.create( {
	x: { $$type: 'size', value: { size: 0, unit: 'deg' } },
	y: { $$type: 'size', value: { size: 0, unit: 'deg' } },
	z: { $$type: 'size', value: { size: 0, unit: 'deg' } },
} );

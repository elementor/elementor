import { numberPropTypeUtil, scaleTransformPropTypeUtil, rotateTransformPropTypeUtil, type TransformItemPropValue } from '@elementor/editor-props';

export type TransformFunction = 'transform-move' | 'transform-scale' | 'transform-rotate';

export const TransformFunctionKeys: Record< string, TransformFunction > = {
	move: 'transform-move',
	scale: 'transform-scale',
    rotate: 'transform-rotate',
};

export const defaultValues = {
	move: {
		size: 0,
		unit: 'px',
	},
	scale: 1,
};

export const initialTransformValue: TransformItemPropValue = {
	$$type: TransformFunctionKeys.move,
	value: {
		x: { $$type: 'size', value: { size: defaultValues.move.size, unit: defaultValues.move.unit as 'px' } },
		y: { $$type: 'size', value: { size: defaultValues.move.size, unit: defaultValues.move.unit as 'px' } },
		z: { $$type: 'size', value: { size: defaultValues.move.size, unit: defaultValues.move.unit as 'px' } },
	},
};

export const initialScaleValue = scaleTransformPropTypeUtil.create( {
	x: numberPropTypeUtil.create( defaultValues.scale ),
	y: numberPropTypeUtil.create( defaultValues.scale ),
	z: numberPropTypeUtil.create( defaultValues.scale ),
} );

export const initialRotateValue = rotateTransformPropTypeUtil.create( {
	x: { $$type: 'size', value: { size: 0, unit: 'deg' } },
	y: { $$type: 'size', value: { size: 0, unit: 'deg' } },
	z: { $$type: 'size', value: { size: 0, unit: 'deg' } },
} );



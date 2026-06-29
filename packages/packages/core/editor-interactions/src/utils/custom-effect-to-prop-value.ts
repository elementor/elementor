import { type PropValue } from '@elementor/editor-props';

const CUSTOM_EFFECT_TYPE = 'custom-effect';
const KEYFRAMES_TYPE = 'keyframes';
const KEYFRAME_STOP_TYPE = 'keyframe-stop';
const KEYFRAME_STOP_SETTINGS_TYPE = 'keyframe-stop-settings';
const SIZE_TYPE = 'size';
const NUMBER_TYPE = 'number';
const TRANSFORM_SCALE_TYPE = 'transform-scale';
const TRANSFORM_ROTATE_TYPE = 'transform-rotate';
const TRANSFORM_MOVE_TYPE = 'transform-move';
const TRANSFORM_SKEW_TYPE = 'transform-skew';
const UNIT_PERCENT = '%';
const UNIT_DEG = 'deg';
const UNIT_PX = 'px';

export type PlainKeyframeValue = {
	opacity?: number;
	scale?: { x: number; y: number };
	rotate?: { x: number; y: number; z: number };
	move?: { x: number; y: number; z: number };
	skew?: { x: number; y: number };
};

export type PlainKeyframe = { stop: number; value: PlainKeyframeValue };

export type PlainCustomEffect = { keyframes: PlainKeyframe[] };

const isPlainCustomEffect = ( v: unknown ): v is PlainCustomEffect =>
	typeof v === 'object' &&
	v !== null &&
	'keyframes' in v &&
	Array.isArray( ( v as PlainCustomEffect ).keyframes ) &&
	! ( '$$type' in v );

const toSizePropValue = ( size: number, unit: string = UNIT_PERCENT ): PropValue => ( {
	$$type: SIZE_TYPE,
	value: { size, unit },
} );

const toNumberPropValue = ( n: number ): PropValue => ( {
	$$type: NUMBER_TYPE,
	value: n,
} );

const toDimensionalNumberPropValue = (
	type: string,
	plain: { x?: number; y?: number; z?: number },
	defaults: { x: number; y: number; z: number }
): PropValue => ( {
	$$type: type,
	value: {
		x: toNumberPropValue( plain.x ?? defaults.x ),
		y: toNumberPropValue( plain.y ?? defaults.y ),
		z: toNumberPropValue( plain.z ?? defaults.z ),
	},
} );

const toDimensionalSizePropValue = (
	type: string,
	plain: { x?: number; y?: number; z?: number },
	defaults: { x: number; y: number; z: number },
	unit: string
): PropValue => ( {
	$$type: type,
	value: {
		x: toSizePropValue( plain.x ?? defaults.x, unit ),
		y: toSizePropValue( plain.y ?? defaults.y, unit ),
		z: toSizePropValue( plain.z ?? defaults.z, unit ),
	},
} );

const toSkewPropValue = ( plain: { x?: number; y?: number } ): PropValue => ( {
	$$type: TRANSFORM_SKEW_TYPE,
	value: {
		x: toSizePropValue( plain.x ?? 0, UNIT_DEG ),
		y: toSizePropValue( plain.y ?? 0, UNIT_DEG ),
	},
} );

const toKeyframeStopSettingsPropValue = ( plain: PlainKeyframeValue ): PropValue => {
	const value: Record< string, PropValue > = {};
	if ( plain.opacity !== undefined ) {
		const percent = plain.opacity <= 1 ? Math.round( plain.opacity * 100 ) : plain.opacity;
		value.opacity = toSizePropValue( percent );
	}
	if ( plain.scale !== undefined ) {
		value.scale = toDimensionalNumberPropValue( TRANSFORM_SCALE_TYPE, plain.scale, { x: 1, y: 1, z: 1 } );
	}
	if ( plain.rotate !== undefined ) {
		value.rotate = toDimensionalSizePropValue(
			TRANSFORM_ROTATE_TYPE,
			plain.rotate,
			{ x: 0, y: 0, z: 0 },
			UNIT_DEG
		);
	}
	if ( plain.move !== undefined ) {
		value.move = toDimensionalSizePropValue( TRANSFORM_MOVE_TYPE, plain.move, { x: 0, y: 0, z: 0 }, UNIT_PX );
	}
	if ( plain.skew !== undefined ) {
		value.skew = toSkewPropValue( plain.skew );
	}
	return { $$type: KEYFRAME_STOP_SETTINGS_TYPE, value };
};

const isPlainKeyframe = ( v: unknown ): v is PlainKeyframe =>
	typeof v === 'object' && v !== null && 'stop' in v && 'value' in v && ! ( '$$type' in v );

const toKeyframeStopPropValue = ( item: PlainKeyframe | PropValue ): PropValue => {
	if ( ! isPlainKeyframe( item ) ) {
		return item as PropValue;
	}
	return {
		$$type: KEYFRAME_STOP_TYPE,
		value: {
			stop: toSizePropValue( item.stop ),
			settings: toKeyframeStopSettingsPropValue( item.value ),
		},
	};
};

const toKeyframesPropValue = ( keyframes: ( PlainKeyframe | PropValue )[] ): PropValue => ( {
	$$type: KEYFRAMES_TYPE,
	value: keyframes.map( toKeyframeStopPropValue ),
} );

const plainCustomEffectToPropValue = ( plain: PlainCustomEffect ): PropValue => ( {
	$$type: CUSTOM_EFFECT_TYPE,
	value: {
		keyframes: toKeyframesPropValue( plain.keyframes as ( PlainKeyframe | PropValue )[] ),
	},
} );

export const toCustomEffectPropValue = (
	customEffects: PropValue | PlainCustomEffect | undefined
): PropValue | undefined => {
	if ( customEffects === undefined ) {
		return undefined;
	}
	if ( isPlainCustomEffect( customEffects ) ) {
		return plainCustomEffectToPropValue( customEffects );
	}
	return customEffects as PropValue;
};

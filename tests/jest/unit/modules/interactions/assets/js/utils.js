export function mockBreakpoints( { excluded } ) {
	return {
		$$type: 'interactions-breakpoints',
		value: {
			excluded: {
				$$type: 'excluded-breakpoints',
				value: excluded.map( ( breakpoint ) => {
					return { $$type: 'string', value: breakpoint };
				} ),
			},
		},
	};
}

export function mockTiming( { duration, delay } ) {
	return {
		$$type: 'timing-config',
		value: {
			duration: { $$type: 'size', value: { size: duration, unit: 'ms' } },
			delay: { $$type: 'size', value: { size: delay, unit: 'ms' } },
		},
	};
}

export function mockConfig( { replay, easing, relativeTo, offsetTop, offsetBottom } ) {
	return {
		$$type: 'config',
		value: {
			replay: { $$type: 'boolean', value: replay },
			easing: { $$type: 'string', value: easing },
			relativeTo: { $$type: 'string', value: relativeTo },
			offsetTop: { $$type: 'size', value: { size: offsetTop, unit: '%' } },
			offsetBottom: { $$type: 'size', value: { size: offsetBottom, unit: '%' } },
		},
	};
}

function mockTransformMove( { x, y, z } ) {
	const value = {};

	if ( undefined !== x ) {
		value.x = { $$type: 'size', value: { size: x, unit: 'px' } };
	}

	if ( undefined !== y ) {
		value.y = { $$type: 'size', value: { size: y, unit: 'px' } };
	}

	if ( undefined !== z ) {
		value.z = { $$type: 'size', value: { size: z, unit: 'px' } };
	}

	return {
		$$type: 'transform-move',
		value,
	};
}

function mockTransformRotate( { x, y, z } ) {
	const value = {};

	if ( undefined !== x ) {
		value.x = { $$type: 'size', value: { size: x, unit: 'deg' } };
	}

	if ( undefined !== y ) {
		value.y = { $$type: 'size', value: { size: y, unit: 'turn' } };
	}

	if ( undefined !== z ) {
		value.z = { $$type: 'size', value: { size: z, unit: 'rad' } };
	}

	return {
		$$type: 'transform-rotate',
		value,
	};
}

function mockTransformScale( { x, y } ) {
	const value = {};

	if ( undefined !== x ) {
		value.x = { $$type: 'number', value: x };
	}

	if ( undefined !== y ) {
		value.y = { $$type: 'number', value: y };
	}

	return {
		$$type: 'transform-scale',
		value,
	};
}

function mockTransformSkew( { x, y } ) {
	const value = {};

	if ( undefined !== x ) {
		value.x = { $$type: 'size', value: { size: x, unit: 'deg' } };
	}

	if ( undefined !== y ) {
		value.y = { $$type: 'size', value: { size: y, unit: 'turn' } };
	}

	return {
		$$type: 'transform-skew',
		value,
	};
}

export function mockKeyframeSettings( { opacity, move, rotate, scale, skew } ) {
	const value = {};

	if ( null !== opacity && undefined !== opacity && '' !== opacity ) {
		value.opacity = { $$type: 'size', value: { size: opacity, unit: '%' } };
	}

	if ( move ) {
		value.move = mockTransformMove( move );
	}

	if ( rotate ) {
		value.rotate = mockTransformRotate( rotate );
	}

	if ( scale ) {
		value.scale = mockTransformScale( scale );
	}

	if ( skew ) {
		value.skew = mockTransformSkew( skew );
	}

	return {
		$$type: 'keyframe-stop-settings',
		value,
	};
}

export function mockKeyframe( { stop, settings } ) {
	return {
		$$type: 'keyframe-stop',
		value: {
			stop: { $$type: 'size', value: { size: stop, unit: '%' } },
			settings,
		},
	};
}

export function mockCustomEffect( { keyframes } ) {
	return {
		$$type: 'custom-effect',
		value: {
			keyframes,
		},
	};
}

export function mockAnimation( { effect, customEffect, type, direction, timingConfig, config } ) {
	return {
		$$type: 'animation-preset-props',
		value: {
			effect: { $$type: 'string', value: effect },
			type: { $$type: 'string', value: type },
			direction: { $$type: 'string', value: direction },

			custom_effect: customEffect,
			timing_config: timingConfig,
			config,
		},
	};
}

export function mockInteraction( { interactionId, trigger, animation, breakpoints } ) {
	return {
		$$type: 'interaction-item',
		value: {
			interaction_id: { $$type: 'string', value: interactionId },
			trigger: { $$type: 'string', value: trigger },

			animation,
			breakpoints,
		},
	};
}

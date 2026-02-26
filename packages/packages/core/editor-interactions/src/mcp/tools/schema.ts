import { z } from '@elementor/schema';

export const baseSchema = {
	trigger: z.enum( [ 'load', 'scrollIn' ] ).optional().describe( 'Event that triggers the animation' ),
	effect: z.enum( [ 'fade', 'slide', 'scale' ] ).optional().describe( 'Animation effect type' ),
	effectType: z.enum( [ 'in', 'out' ] ).optional().describe( 'Whether the animation plays in or out' ),
	direction: z
		.enum( [ 'top', 'bottom', 'left', 'right', '' ] )
		.optional()
		.describe( 'Direction for slide effect. Use empty string for fade/scale.' ),
	duration: z.number().min( 0 ).max( 10000 ).optional().describe( 'Animation duration in milliseconds' ),
	delay: z.number().min( 0 ).max( 10000 ).optional().describe( 'Animation delay in milliseconds' ),
	easing: z.string().optional().describe( 'Easing function. See interactions schema for options.' ),
	excludedBreakpoints: z
		.array( z.string() )
		.optional()
		.describe(
			'Breakpoint IDs on which this interaction is disabled (e.g. ["mobile", "tablet"]). Omit to enable on all breakpoints.'
		),
};

export const proSchema = {
	trigger: z
		.enum( [ 'load', 'scrollIn', 'scrollOut', 'scrollOn', 'hover', 'click' ] )
		.optional()
		.describe( 'Event that triggers the animation' ),
	effect: z.enum( [ 'fade', 'slide', 'scale', 'custom' ] ).optional().describe( 'Animation effect type' ),
	customEffect: z
		.object( {
			keyframes: z
				.array(
					z.object( {
						stop: z.number().describe( 'The stop of the keyframe in percent, can be either 0 or 100' ),
						value: z.object( {
							opacity: z.number().min( 0 ).max( 1 ).describe( 'The opacity of the keyframe' ),
							scale: z
								.object( {
									x: z.number().min( 0 ).max( 1 ).describe( 'The x scale of the keyframe' ),
									y: z.number().min( 0 ).max( 1 ).describe( 'The y scale of the keyframe' ),
								} )
								.optional()
								.describe( 'The scale of the keyframe' ),
							rotate: z
								.object( {
									x: z.number().min( 0 ).max( 360 ).describe( 'The x rotate of the keyframe' ),
									y: z.number().min( 0 ).max( 360 ).describe( 'The y rotate of the keyframe' ),
									z: z.number().min( 0 ).max( 360 ).describe( 'The z rotate of the keyframe' ),
								} )
								.optional()
								.describe( 'The rotate of the keyframe' ),
							move: z
								.object( {
									x: z.number().min( 0 ).max( 1 ).describe( 'The x move of the keyframe' ),
									y: z.number().min( 0 ).max( 1 ).describe( 'The y move of the keyframe' ),
									z: z.number().min( 0 ).max( 1 ).describe( 'The z move of the keyframe' ),
								} )
								.optional()
								.describe( 'The move of the keyframe' ),
							skew: z
								.object( {
									x: z.number().min( 0 ).max( 360 ).describe( 'The x skew of the keyframe' ),
									y: z.number().min( 0 ).max( 360 ).describe( 'The y skew of the keyframe' ),
								} )
								.optional()
								.describe( 'The skew of the keyframe' ),
						} ),
					} )
				)
				.describe( 'The keyframes of the custom effect' ),
		} )
		.optional()
		.describe( 'The custom effect to use for the animation' ),
};
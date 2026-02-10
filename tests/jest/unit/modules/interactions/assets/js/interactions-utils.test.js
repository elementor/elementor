import {
	getKeyframes,
	parseAnimationName,
	extractAnimationConfig,
	extractInteractionId,
	getAnimateFunction,
	getInViewFunction,
	waitForAnimateFunction,
	parseInteractionsData,
} from 'elementor/modules/interactions/assets/js/interactions-utils';

describe( 'interactions-utils', () => {
	describe( 'getKeyframes', () => {
		it( 'should generate fade in keyframes without direction', () => {
			const result = getKeyframes( 'fade', 'in', '' );
			expect( result ).toEqual( { opacity: [ 0, 1 ] } );
		} );

		it( 'should generate fade out keyframes without direction', () => {
			const result = getKeyframes( 'fade', 'out', '' );
			expect( result ).toEqual( { opacity: [ 1, 0 ] } );
		} );

		it( 'should generate fade in keyframes with direction', () => {
			const result = getKeyframes( 'fade', 'in', 'top' );
			expect( result ).toEqual( {
				opacity: [ 0, 1 ],
				y: [ -100, 0 ],
			} );
		} );

		it( 'should generate fade out keyframes with direction', () => {
			const result = getKeyframes( 'fade', 'out', 'bottom' );
			expect( result ).toEqual( {
				opacity: [ 1, 0 ],
				y: [ 0, 100 ],
			} );
		} );

		it( 'should generate scale in keyframes', () => {
			const result = getKeyframes( 'scale', 'in', '' );
			expect( result ).toEqual( { scale: [ 0, 1 ] } );
		} );

		it( 'should generate scale out keyframes', () => {
			const result = getKeyframes( 'scale', 'out', '' );
			expect( result ).toEqual( { scale: [ 1, 0 ] } );
		} );

		it( 'should generate slide left keyframes', () => {
			const result = getKeyframes( 'slide', 'in', 'left' );
			expect( result ).toEqual( { x: [ -100, 0 ] } );
		} );

		it( 'should generate slide right keyframes', () => {
			const result = getKeyframes( 'slide', 'in', 'right' );
			expect( result ).toEqual( { x: [ 100, 0 ] } );
		} );

		it( 'should generate slide top keyframes', () => {
			const result = getKeyframes( 'slide', 'in', 'top' );
			expect( result ).toEqual( { y: [ -100, 0 ] } );
		} );

		it( 'should generate slide bottom keyframes', () => {
			const result = getKeyframes( 'slide', 'in', 'bottom' );
			expect( result ).toEqual( { y: [ 100, 0 ] } );
		} );

		it( 'should generate slide out keyframes', () => {
			const result = getKeyframes( 'slide', 'out', 'left' );
			expect( result ).toEqual( { x: [ 0, -100 ] } );
		} );

		it( 'should handle RTL direction correctly', () => {
			const originalDir = document.documentElement.dir;
			document.documentElement.dir = 'rtl';
			const result = getKeyframes( 'slide', 'in', 'left' );
			expect( result ).toEqual( { x: [ -100, 0 ] } );
			document.documentElement.dir = originalDir;
		} );
	} );

	describe( 'parseAnimationName', () => {
		it( 'should parse complete animation name', () => {
			const result = parseAnimationName( 'load-fade-in-top-300-100--easeIn' );
			expect( result ).toEqual( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'top',
				duration: 300,
				delay: 100,
				replay: false,
				easing: 'easeIn',
			} );
		} );

		it( 'should parse animation name without direction', () => {
			const result = parseAnimationName( 'scrollIn-fade-out--500-0' );
			expect( result ).toEqual( {
				trigger: 'scrollIn',
				effect: 'fade',
				type: 'out',
				direction: null,
				duration: 500,
				replay: false,
				delay: 0,
				easing: 'easeIn',
			} );
		} );

		it( 'should use default duration when missing', () => {
			const result = parseAnimationName( 'load-fade-in' );
			expect( result.duration ).toBe( 600 );
		} );

		it( 'should use default delay when missing', () => {
			const result = parseAnimationName( 'load-fade-in--300--easeIn' );
			expect( result.delay ).toBe( 0 );
		} );
	} );

	describe( 'extractAnimationConfig', () => {
		it( 'should parse legacy string into anim config', () => {
			const result = extractAnimationConfig( 'load-fade-in-top-300-100--easeIn' );
			expect( result ).toEqual( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'top',
				duration: 300,
				delay: 100,
				easing: 'easeIn',
				replay: false,
			} );
		} );

		it( 'should normalize typed wrapper interaction into anim config (ms)', () => {
			const interaction = {
				$$type: 'interaction-item',
				value: {
					trigger: { $$type: 'string', value: 'load' },
					animation: {
						$$type: 'animation-preset-props',
						value: {
							effect: { $$type: 'string', value: 'fade' },
							type: { $$type: 'string', value: 'in' },
							direction: { $$type: 'string', value: 'right' },
							timing_config: {
								$$type: 'timing-config',
								value: {
									duration: { $$type: 'size', value: { size: 300, unit: 'ms' } },
									delay: { $$type: 'size', value: { size: 0, unit: 'ms' } },
								},
							},
						},
					},
				},
			};

			const result = extractAnimationConfig( interaction );
			expect( result ).toEqual( {
				trigger: 'load',
				effect: 'fade',
				type: 'in',
				direction: 'right',
				duration: 300,
				delay: 0,
				easing: 'easeIn',
				replay: false,
			} );
		} );

		it( 'should normalize size in seconds into ms', () => {
			const interaction = {
				$$type: 'interaction-item',
				value: {
					trigger: { $$type: 'string', value: 'load' },
					animation: {
						$$type: 'animation-preset-props',
						value: {
							effect: { $$type: 'string', value: 'fade' },
							type: { $$type: 'string', value: 'in' },
							direction: { $$type: 'string', value: 'right' },
							timing_config: {
								$$type: 'timing-config',
								value: {
									duration: { $$type: 'size', value: { size: 0.6, unit: 's' } },
									delay: { $$type: 'size', value: { size: 0.1, unit: 's' } },
								},
							},
						},
					},
				},
			};

			const result = extractAnimationConfig( interaction );
			expect( result.duration ).toBe( 600 );
			expect( result.delay ).toBe( 100 );
		} );
	} );

	describe( 'getAnimateFunction', () => {
		beforeEach( () => {
			delete window.animate;
			delete window.Motion;
		} );

		it( 'should return native animate function when available', () => {
			const mockAnimate = jest.fn();
			global.animate = mockAnimate;
			expect( getAnimateFunction() ).toBe( mockAnimate );
		} );

		it( 'should return Motion.animate when native animate is not available', () => {
			const mockMotion = { animate: jest.fn() };
			window.Motion = mockMotion;
			expect( getAnimateFunction() ).toBe( mockMotion.animate );
		} );

		it( 'should return undefined when neither is available', () => {
			expect( getAnimateFunction() ).toBeUndefined();
		} );
	} );

	describe( 'getInViewFunction', () => {
		beforeEach( () => {
			delete window.inView;
			delete window.Motion;
		} );

		it( 'should return native inView function when available', () => {
			const mockInView = jest.fn();
			global.inView = mockInView;
			expect( getInViewFunction() ).toBe( mockInView );
		} );

		it( 'should return Motion.inView when native inView is not available', () => {
			const mockMotion = { inView: jest.fn() };
			window.Motion = mockMotion;
			expect( getInViewFunction() ).toBe( mockMotion.inView );
		} );

		it( 'should return undefined when neither is available', () => {
			expect( getInViewFunction() ).toBeUndefined();
		} );
	} );

	describe( 'waitForAnimateFunction', () => {
		beforeEach( () => {
			jest.useFakeTimers();
			delete window.animate;
			delete window.Motion;
		} );

		afterEach( () => {
			jest.useRealTimers();
		} );

		it( 'should call callback immediately if animate function exists', () => {
			const callback = jest.fn();
			global.animate = jest.fn();
			waitForAnimateFunction( callback );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should poll for animate function and call callback when available', () => {
			const callback = jest.fn();
			waitForAnimateFunction( callback, 5 );
			expect( callback ).not.toHaveBeenCalled();
			jest.advanceTimersByTime( 100 );
			global.animate = jest.fn();
			jest.advanceTimersByTime( 100 );
			expect( callback ).toHaveBeenCalled();
		} );

		it( 'should stop polling after maxAttempts', () => {
			const callback = jest.fn();
			waitForAnimateFunction( callback, 3 );
			jest.advanceTimersByTime( 500 );
			expect( callback ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'parseInteractionsData', () => {
		it( 'should parse valid JSON string', () => {
			const data = JSON.stringify( { items: [], version: 1 } );
			const result = parseInteractionsData( data );
			expect( result ).toEqual( { items: [], version: 1 } );
		} );

		it( 'should return data as-is when it is already an object', () => {
			const data = { items: [], version: 1 };
			const result = parseInteractionsData( data );
			expect( result ).toBe( data );
		} );

		it( 'should return null for invalid JSON string', () => {
			const result = parseInteractionsData( '{ invalid json }' );
			expect( result ).toBeNull();
		} );

		it( 'should handle empty string', () => {
			const result = parseInteractionsData( '' );
			expect( result ).toBeNull();
		} );
	} );
	describe( 'extractInteractionId', () => {
		it( 'should extract interaction_id from valid interaction item', () => {
			const interaction = {
				$$type: 'interaction-item',
				value: {
					interaction_id: {
						$$type: 'string',
						value: 'test-interaction-id-123',
					},
					trigger: { $$type: 'string', value: 'load' },
				},
			};

			const result = extractInteractionId( interaction );
			expect( result ).toBe( 'test-interaction-id-123' );
		} );

		it( 'should return null when interaction_id is missing', () => {
			const interaction = {
				$$type: 'interaction-item',
				value: {
					trigger: { $$type: 'string', value: 'load' },
				},
			};

			const result = extractInteractionId( interaction );
			expect( result ).toBeNull();
		} );

		it( 'should return null when interaction_id value is missing', () => {
			const interaction = {
				$$type: 'interaction-item',
				value: {
					interaction_id: { $$type: 'string' },
					trigger: { $$type: 'string', value: 'load' },
				},
			};

			const result = extractInteractionId( interaction );
			expect( result ).toBeNull();
		} );

		it( 'should return null for invalid interaction structure', () => {
			expect( extractInteractionId( null ) ).toBeNull();
			expect( extractInteractionId( undefined ) ).toBeNull();
			expect( extractInteractionId( {} ) ).toBeNull();
			expect( extractInteractionId( { $$type: 'wrong-type' } ) ).toBeNull();
			expect( extractInteractionId( { $$type: 'interaction-item' } ) ).toBeNull();
			expect( extractInteractionId( { $$type: 'interaction-item', value: null } ) ).toBeNull();
		} );

		it( 'should handle temp IDs correctly', () => {
			const interaction = {
				$$type: 'interaction-item',
				value: {
					interaction_id: {
						$$type: 'string',
						value: 'temp-abc123xyz',
					},
					trigger: { $$type: 'string', value: 'load' },
				},
			};

			const result = extractInteractionId( interaction );
			expect( result ).toBe( 'temp-abc123xyz' );
		} );
	} );
} );

import {
    getKeyframes,
    parseAnimationName,
    extractAnimationId,
    getAnimateFunction,
    getInViewFunction,
    waitForAnimateFunction,
    parseInteractionsData,
} from '../../../../../../../modules/interactions/assets/js/interactions-utils';

describe( 'interactions-utils', () => {
    describe( 'getKeyframes', () => {
        let mockElement;

        beforeEach( () => {
            mockElement = {
                getBoundingClientRect: jest.fn( () => ( {
                    left: 100,
                    right: 200,
                    top: 50,
                    bottom: 150,
                    width: 100,
                    height: 100,
                } ) ),
            };
            window.innerWidth = 1920;
            window.innerHeight = 1080;
            document.documentElement.dir = 'ltr';
        } );

        it( 'should generate fade in keyframes without direction', () => {
            const result = getKeyframes( 'fade', 'in', '' );
            expect( result ).toEqual( { opacity: [ 0, 1 ] } );
        } );

        it( 'should generate fade out keyframes without direction', () => {
            const result = getKeyframes( 'fade', 'out', '' );
            expect( result ).toEqual( { opacity: [ 1, 0 ] } );
        } );

        it( 'should generate fade in keyframes with direction', () => {
            const result = getKeyframes( 'fade', 'in', 'top', mockElement );
            expect( result.opacity ).toEqual( [ 0, 0, 0.2, 0.6, 1 ] );
        } );

        it( 'should generate fade out keyframes with direction', () => {
            const result = getKeyframes( 'fade', 'out', 'bottom', mockElement );
            expect( result.opacity ).toEqual( [ 1, 0.8, 0.4, 0, 0 ] );
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
            const result = getKeyframes( 'slide', 'in', 'left', mockElement );
            expect( result.x ).toBeDefined();
            expect( result.x[ 0 ] ).toBeLessThan( 0 );
            expect( result.x[ 1 ] ).toBe( 0 );
        } );

        it( 'should generate slide right keyframes', () => {
            const result = getKeyframes( 'slide', 'in', 'right', mockElement );
            expect( result.x ).toBeDefined();
            expect( result.x[ 0 ] ).toBeGreaterThan( 0 );
            expect( result.x[ 1 ] ).toBe( 0 );
        } );

        it( 'should generate slide top keyframes', () => {
            const result = getKeyframes( 'slide', 'in', 'top', mockElement );
            expect( result.y ).toBeDefined();
            expect( result.y[ 0 ] ).toBeLessThan( 0 );
            expect( result.y[ 1 ] ).toBe( 0 );
        } );

        it( 'should generate slide bottom keyframes', () => {
            const result = getKeyframes( 'slide', 'in', 'bottom', mockElement );
            expect( result.y ).toBeDefined();
            expect( result.y[ 0 ] ).toBeGreaterThan( 0 );
            expect( result.y[ 1 ] ).toBe( 0 );
        } );

        it( 'should use default slide distance when element is null', () => {
            const result = getKeyframes( 'slide', 'in', 'left', null );
            expect( result.x[ 0 ] ).toBeLessThan( 0 );
        } );

        it( 'should handle RTL direction correctly', () => {
            document.documentElement.dir = 'rtl';
            const result = getKeyframes( 'slide', 'in', 'left', mockElement );
            expect( result.x ).toBeDefined();
        } );
    } );

    describe( 'parseAnimationName', () => {
        it( 'should parse complete animation name', () => {
            const result = parseAnimationName( 'load-fade-in-top-300-100' );
            expect( result ).toEqual( {
                trigger: 'load',
                effect: 'fade',
                type: 'in',
                direction: 'top',
                duration: 300,
                delay: 100,
            } );
        } );

        it( 'should parse animation name without direction', () => {
            const result = parseAnimationName( 'scrollIn-fade-out-500-0' );
            expect( result ).toEqual( {
                trigger: 'scrollIn',
                effect: 'fade',
                type: 'out',
                direction: null,
                duration: 500,
                delay: 0,
            } );
        } );

        it( 'should use default duration when missing', () => {
            const result = parseAnimationName( 'load-fade-in' );
            expect( result.duration ).toBe( 300 );
        } );

        it( 'should use default delay when missing', () => {
            const result = parseAnimationName( 'load-fade-in-300' );
            expect( result.delay ).toBe( 0 );
        } );
    } );

    describe( 'extractAnimationId', () => {
        it( 'should return string when interaction is string', () => {
            expect( extractAnimationId( 'simple-string-id' ) ).toBe( 'simple-string-id' );
        } );

        it( 'should extract animation ID from interaction item', () => {
            const interaction = {
                $$type: 'interaction-item',
                value: {
                    trigger: { $$type: 'string', value: 'load' },
                    animation: {
                        $$type: 'animation-preset-props',
                        value: {
                            effect: { $$type: 'string', value: 'fade' },
                            type: { $$type: 'string', value: 'in' },
                            direction: { $$type: 'string', value: 'top' },
                            timing_config: {
                                $$type: 'timing-config',
                                value: {
                                    duration: { $$type: 'number', value: 300 },
                                    delay: { $$type: 'number', value: 100 },
                                },
                            },
                        },
                    },
                },
            };
            const result = extractAnimationId( interaction );
            expect( result ).toBe( 'load-fade-in-top-300-100' );
        } );

        it( 'should use default values when missing', () => {
            const interaction = {
                $$type: 'interaction-item',
                value: {
                    animation: {
                        $$type: 'animation-preset-props',
                        value: {},
                    },
                },
            };
            const result = extractAnimationId( interaction );
            expect( result ).toBe( 'load-fade-in--300-0' );
        } );

        it( 'should return null for invalid interaction', () => {
            expect( extractAnimationId( null ) ).toBeNull();
            expect( extractAnimationId( {} ) ).toBeNull();
            expect( extractAnimationId( { $$type: 'wrong-type' } ) ).toBeNull();
        } );

        it( 'should extract animation_id from legacy format', () => {
            const interaction = {
                animation: {
                    animation_id: 'legacy-id-123',
                },
            };
            expect( extractAnimationId( interaction ) ).toBe( 'legacy-id-123' );
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

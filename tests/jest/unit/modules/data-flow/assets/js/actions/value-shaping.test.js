import { createChannel, mapRange } from 'elementor/modules/data-flow/assets/js/actions/value-shaping';

const FRAME = 1 / 60;

function runFrames( channel, frames ) {
	for ( let i = 0; i < frames; i++ ) {
		channel.step( FRAME );
	}
}

describe( 'mapRange', () => {
	it( 'should map a value from the input range to the output range and clamp it', () => {
		// Act & Assert
		expect( mapRange( 0, [ -1, 1, -10, 10 ] ) ).toBe( 0 );
		expect( mapRange( 0.5, [ 0, 1, 0, 100 ] ) ).toBe( 50 );
		expect( mapRange( 2, [ 0, 1, 0, 100 ] ) ).toBe( 100 );
	} );

	it( 'should extrapolate when clamping is disabled', () => {
		// Act & Assert
		expect( mapRange( 2, [ 0, 1, 0, 100 ], false ) ).toBe( 200 );
	} );

	it( 'should return the output start for an empty input range', () => {
		// Act & Assert
		expect( mapRange( 5, [ 1, 1, 3, 9 ] ) ).toBe( 3 );
	} );
} );

describe( 'createChannel', () => {
	it( 'should apply the mapped target directly without smoothing', () => {
		// Arrange
		const channel = createChannel( { map: [ 0, 1, 0, 100 ] } );

		// Act
		channel.setTarget( 0.25 );
		const moving = channel.step( FRAME );

		// Assert
		expect( channel.value ).toBe( 25 );
		expect( moving ).toBe( false );
	} );

	it( 'should ease toward the target when smoothing is set', () => {
		// Arrange
		const channel = createChannel( { smooth: 0.8 } );

		// Act
		channel.setTarget( 100 );
		channel.step( FRAME );

		// Assert
		expect( channel.value ).toBeGreaterThan( 0 );
		expect( channel.value ).toBeLessThan( 100 );

		runFrames( channel, 600 );
		expect( channel.value ).toBe( 100 );
	} );

	it( 'should settle a spring on the target', () => {
		// Arrange
		const channel = createChannel( { spring: { stiffness: 170, damping: 12 } } );

		// Act
		channel.setTarget( 10 );
		runFrames( channel, 20 );

		// Assert
		expect( channel.value ).not.toBe( 10 );

		runFrames( channel, 600 );
		expect( channel.value ).toBe( 10 );
		expect( channel.step( FRAME ) ).toBe( false );
	} );

	it( 'should hold peaks and release them with decay', () => {
		// Arrange
		const channel = createChannel( { decay: 0.9 } );
		channel.setTarget( 10 );
		channel.step( FRAME );

		// Act
		channel.setTarget( 0 );
		channel.step( FRAME );

		// Assert
		expect( channel.value ).toBeCloseTo( 9 );

		runFrames( channel, 600 );
		expect( channel.value ).toBe( 0 );
	} );

	it( 'should start from the initial value', () => {
		// Act
		const channel = createChannel( {}, 5 );

		// Assert
		expect( channel.value ).toBe( 5 );
	} );
} );

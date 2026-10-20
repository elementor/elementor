import { backgroundGradientOverlayTransformer } from '../background-gradient-overlay-transformer';

function run( value: { type?: 'linear' | 'radial'; angle?: number | null; stops?: string; positions?: string } ) {
	return backgroundGradientOverlayTransformer( value, { key: 'background-overlay', signal: undefined } );
}

describe( 'backgroundGradientOverlayTransformer', () => {
	it( 'emits the angle when a linear gradient has one', () => {
		expect( run( { type: 'linear', angle: 180, stops: 'red 0%,blue 100%' } ) ).toBe(
			'linear-gradient(180deg, red 0%,blue 100%)'
		);
	} );

	it( 'omits the angle when it is null so the declaration stays valid', () => {
		expect(
			run( {
				type: 'linear',
				angle: null,
				stops: 'rgba(0, 0, 0, 0.35) 0%,rgba(0, 0, 0, 0.35) 100%',
			} )
		).toBe( 'linear-gradient(rgba(0, 0, 0, 0.35) 0%,rgba(0, 0, 0, 0.35) 100%)' );
	} );

	it( 'omits the angle when it is missing', () => {
		expect( run( { type: 'linear', stops: 'red 0%,blue 100%' } ) ).toBe( 'linear-gradient(red 0%,blue 100%)' );
	} );

	it( 'keeps an explicit zero angle', () => {
		expect( run( { type: 'linear', angle: 0, stops: 'red 0%,blue 100%' } ) ).toBe(
			'linear-gradient(0deg, red 0%,blue 100%)'
		);
	} );

	it( 'emits a radial gradient from positions and stops', () => {
		expect( run( { type: 'radial', positions: 'bottom left', stops: 'red 0%,blue 100%' } ) ).toBe(
			'radial-gradient(circle at bottom left, red 0%,blue 100%)'
		);
	} );
} );

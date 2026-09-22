import { backgroundTransformer } from '../background-transformer';

function run( value: Parameters< typeof backgroundTransformer >[ 0 ] ) {
	return backgroundTransformer( value, { key: 'background', signal: undefined } );
}

describe( 'backgroundTransformer', () => {
	it( 'clears background-image when a solid color has no overlay', () => {
		expect( run( { color: 'red' } ) ).toEqual( {
			'$$multi-props': true,
			value: {
				'background-color': 'red',
				'background-clip': null,
				'background-image': 'none',
			},
		} );
	} );

	it( 'keeps an overlay image when a color is also set', () => {
		expect(
			run( {
				color: 'red',
				'background-overlay': {
					'background-image': 'linear-gradient(red, blue)',
				},
			} )
		).toEqual( {
			'$$multi-props': true,
			value: {
				'background-image': 'linear-gradient(red, blue)',
				'background-color': 'red',
				'background-clip': null,
			},
		} );
	} );

	it( 'does not clear background-image when only clip is set', () => {
		expect( run( { clip: 'padding-box' } ) ).toEqual( {
			'$$multi-props': true,
			value: {
				'background-color': null,
				'background-clip': 'padding-box',
			},
		} );
	} );
} );

import { decodePersistedState, encodePersistedState } from '../persistence';

describe( 'persistence', () => {
	it( 'round-trips a panel state through encode/decode', () => {
		// Arrange.
		const input = {
			'audit-panel': {
				isOpen: true,
				position: { insetInlineStart: 24, insetBlockStart: 80 },
				size: { inlineSize: 320, blockSize: 480 },
				zIndex: 3,
			},
		};

		// Act.
		const decoded = decodePersistedState( encodePersistedState( input ) );

		// Assert.
		expect( decoded ).toEqual( input );
	} );

	it( 'returns an empty record for non-JSON input', () => {
		expect( decodePersistedState( 'not json' ) ).toEqual( {} );
	} );

	it( 'returns an empty record for null/undefined input', () => {
		expect( decodePersistedState( null ) ).toEqual( {} );
		expect( decodePersistedState( undefined ) ).toEqual( {} );
	} );

	it( 'drops malformed panel entries', () => {
		// Arrange.
		const raw = JSON.stringify( {
			'audit-panel': 'not an object',
			'valid-panel': {
				isOpen: false,
				position: { insetInlineStart: 10, insetBlockStart: 10 },
				size: { inlineSize: 300, blockSize: 400 },
				zIndex: 1,
			},
		} );

		// Act.
		const decoded = decodePersistedState( raw );

		// Assert.
		expect( decoded[ 'audit-panel' ] ).toBeUndefined();
		expect( decoded[ 'valid-panel' ] ).toBeDefined();
	} );
} );

import { decodePersistedState, encodePersistedState } from '../persistence';

const validPanelState = {
	isOpen: true,
	zIndex: 3,
	size: { inlineSize: 320, blockSize: 480 },
	corner: 'block-start-inline-start' as const,
	position: {
		insetBlockStart: 80,
		insetBlockEnd: 0,
		insetInlineStart: 24,
		insetInlineEnd: 0,
	},
};

describe( 'persistence', () => {
	it( 'round-trips a panel state through encode/decode', () => {
		// Arrange.
		const input = {
			'audit-panel': validPanelState,
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
				zIndex: 1,
				size: { inlineSize: 300, blockSize: 400 },
				corner: 'block-start-inline-start',
				position: {
					insetBlockStart: 10,
					insetBlockEnd: 0,
					insetInlineStart: 10,
					insetInlineEnd: 0,
				},
			},
		} );

		// Act.
		const decoded = decodePersistedState( raw );

		// Assert.
		expect( decoded[ 'audit-panel' ] ).toBeUndefined();
		expect( decoded[ 'valid-panel' ] ).toBeDefined();
	} );

	it( 'drops panel entries with shallow position or size objects', () => {
		// Arrange.
		const raw = JSON.stringify( {
			'shallow-panel': {
				isOpen: true,
				zIndex: 1,
				size: {},
				position: {},
			},
		} );

		// Act.
		const decoded = decodePersistedState( raw );

		// Assert.
		expect( decoded[ 'shallow-panel' ] ).toBeUndefined();
	} );

	it( 'drops legacy two-inset-only payloads without corner', () => {
		// Arrange.
		const raw = JSON.stringify( {
			'legacy-panel': {
				isOpen: true,
				zIndex: 1,
				position: { insetInlineStart: 24, insetBlockStart: 80 },
				size: { inlineSize: 320, blockSize: 480 },
			},
		} );

		// Act.
		const decoded = decodePersistedState( raw );

		// Assert.
		expect( decoded ).toEqual( {} );
	} );
} );

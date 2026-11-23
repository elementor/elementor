import { toMCPTitle } from '../to-mcp-title';

describe.each( [
	{ namespace: 'super_admin', expected: 'Editor Super Admin' },
	{ namespace: 'editor', expected: 'Editor Editor' },
	{ namespace: 'components', expected: 'Editor Components' },
] )( 'toMCPTitle', ( { namespace, expected } ) => {
	it( `maps "${ namespace }" to "${ expected }"`, () => {
		// Act.
		const title = toMCPTitle( namespace );

		// Assert.
		expect( title ).toBe( expected );
	} );
} );

import { resolveLayoutClickContext } from '../create-angie-layout-behavior';

describe( 'resolveLayoutClickContext', () => {
	it( 'merges the clicked add-section index onto layoutContext', () => {
		const result = resolveLayoutClickContext(
			{ mode: 'new-layout', documentType: 'page' },
			{ documentType: 'wp-post' },
			3
		);

		expect( result ).toEqual( {
			mode: 'new-layout',
			documentType: 'page',
			at: 3,
		} );
	} );
} );

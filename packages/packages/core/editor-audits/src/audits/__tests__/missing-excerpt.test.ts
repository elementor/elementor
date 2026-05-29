import { descriptor, evaluator } from '../missing-excerpt';
import { makeContext } from './fixtures';

describe( descriptor.id, () => {
	it( 'passes when excerpt is non-empty', async () => {
		expect( await evaluator( makeContext( { pageContext: { post_excerpt: 'A summary' } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when excerpt is null', async () => {
		const result = await evaluator( makeContext( { pageContext: { post_excerpt: null } } ) );
		expect( result.status ).toBe( 'fail' );
	} );
} );

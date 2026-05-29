import { descriptor, evaluator } from '../missing-page-title';
import { makeContext } from './fixtures';

describe( descriptor.id, () => {
	it( 'passes when title is non-empty', async () => {
		expect( await evaluator( makeContext( { pageContext: { post_title: 'Hello' } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when title is null', async () => {
		const result = await evaluator( makeContext( { pageContext: { post_title: null } } ) );
		expect( result.status ).toBe( 'fail' );
	} );
} );

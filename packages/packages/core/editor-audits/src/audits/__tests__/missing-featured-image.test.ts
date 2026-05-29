import { descriptor, evaluator } from '../missing-featured-image';
import { makeContext } from './fixtures';

describe( descriptor.id, () => {
	it( 'passes when featured image is set', async () => {
		expect( await evaluator( makeContext( { pageContext: { featured_image_id: 42 } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when featured image is null', async () => {
		const result = await evaluator( makeContext( { pageContext: { featured_image_id: null } } ) );
		expect( result.status ).toBe( 'fail' );
	} );
} );

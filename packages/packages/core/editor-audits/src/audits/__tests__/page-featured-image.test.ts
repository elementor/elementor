import { audit } from '../page-featured-image';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when featured image is set', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { featured_image_id: 42 } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when featured image is null', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { featured_image_id: null } } ) );
		expect( result.status ).toBe( 'fail' );
	} );
} );

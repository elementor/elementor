import { audit } from '../default-design-system';
import { makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'passes when the kit was customized', async () => {
		expect( await audit.evaluate( makeContext( { pageContext: { kit_is_default_unchanged: false } } ) ) ).toEqual( {
			status: 'pass',
		} );
	} );

	it( 'fails when the kit is unchanged from default', async () => {
		const result = await audit.evaluate( makeContext( { pageContext: { kit_is_default_unchanged: true } } ) );
		expect( result.status ).toBe( 'fail' );
	} );
} );

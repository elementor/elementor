import { audit } from '../nested-boxed-containers';
import { makeContainer, makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'passes for a boxed container with a full-width child', async () => {
		const tree = [
			makeContainer( 'outer', { content_width: 'boxed' }, [
				makeContainer( 'inner', { content_width: 'full' } ),
			] ),
		];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when a boxed container is nested inside a boxed parent', async () => {
		const tree = [
			makeContainer( 'outer', { content_width: 'boxed' }, [
				makeContainer( 'inner', { content_width: 'boxed' } ),
			] ),
		];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'inner' );
		}
	} );
} );

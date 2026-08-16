import { type ElementSnapshotNode } from '../../types';
import { audit } from '../deep-nesting';
import { makeContainer, makeContext } from './fixtures';

function makeNestedContainers( depth: number ): ElementSnapshotNode {
	if ( depth === 1 ) {
		return makeContainer( `c${ depth }`, {} );
	}

	return makeContainer( `c${ depth }`, {}, [ makeNestedContainers( depth - 1 ) ] );
}

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'passes at exactly 6 levels of nesting', async () => {
		const tree = [ makeNestedContainers( 6 ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails at 7 levels of nesting', async () => {
		const tree = [ makeNestedContainers( 7 ) ];
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'c1' );
		}
	} );

	it( 'passes with a flat tree of containers', async () => {
		const tree = [ makeContainer( 'a', {} ), makeContainer( 'b', {} ), makeContainer( 'c', {} ) ];

		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );
} );

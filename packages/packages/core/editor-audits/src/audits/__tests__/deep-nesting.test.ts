import { type ElementSnapshotNode } from '../../types';
import { descriptor, evaluator } from '../deep-nesting';
import { makeContainer, makeContext } from './fixtures';

function makeNestedContainers( depth: number ): ElementSnapshotNode {
	if ( depth === 1 ) {
		return makeContainer( `c${ depth }`, {} );
	}

	return makeContainer( `c${ depth }`, {}, [ makeNestedContainers( depth - 1 ) ] );
}

describe( descriptor.id, () => {
	it( 'passes with an empty tree', async () => {
		expect( await evaluator( makeContext() ) ).toEqual( { status: 'pass' } );
	} );

	it( 'passes at exactly 6 levels of nesting', async () => {
		const tree = [ makeNestedContainers( 6 ) ];

		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails at 7 levels of nesting', async () => {
		const tree = [ makeNestedContainers( 7 ) ];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 'c1' );
		}
	} );

	it( 'passes with a flat tree of containers', async () => {
		const tree = [ makeContainer( 'a', {} ), makeContainer( 'b', {} ), makeContainer( 'c', {} ) ];

		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );
} );

import { type ElementSnapshotNode } from '../../types';
import { descriptor, evaluator } from '../uses-sections-or-columns';
import { makeContainer, makeContext } from './fixtures';

describe( descriptor.id, () => {
	it( 'passes for a tree of only containers and widgets', async () => {
		const tree: ElementSnapshotNode[] = [ makeContainer( 'c1', {} ) ];
		expect( await evaluator( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when a section is present', async () => {
		const tree: ElementSnapshotNode[] = [ { id: 's1', elType: 'section', settings: {}, elements: [] } ];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations[ 0 ].elementId ).toBe( 's1' );
		}
	} );

	it( 'flags every column in the tree', async () => {
		const tree: ElementSnapshotNode[] = [
			{ id: 'col-a', elType: 'column', settings: {}, elements: [] },
			{ id: 'col-b', elType: 'column', settings: {}, elements: [] },
		];
		const result = await evaluator( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 2 );
		}
	} );
} );

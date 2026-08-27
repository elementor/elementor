import { type ElementSnapshotNode } from '../../types';
import { audit } from '../sections-and-columns';
import { makeContainer, makeContext } from './fixtures';

describe( audit.id, () => {
	it( 'is skipped with an empty tree', async () => {
		expect( await audit.evaluate( makeContext() ) ).toEqual( {
			status: 'skipped',
			reason: 'No elements',
		} );
	} );

	it( 'passes for a tree of only containers and widgets', async () => {
		const tree: ElementSnapshotNode[] = [ makeContainer( 'c1', {} ) ];
		expect( await audit.evaluate( makeContext( { tree } ) ) ).toEqual( { status: 'pass' } );
	} );

	it( 'fails when a section is present', async () => {
		const tree: ElementSnapshotNode[] = [ { id: 's1', elType: 'section', settings: {}, elements: [] } ];
		const result = await audit.evaluate( makeContext( { tree } ) );

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
		const result = await audit.evaluate( makeContext( { tree } ) );

		expect( result.status ).toBe( 'fail' );

		if ( result.status === 'fail' ) {
			expect( result.violations ).toHaveLength( 2 );
		}
	} );
} );

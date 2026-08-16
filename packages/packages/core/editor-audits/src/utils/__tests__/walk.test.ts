import { type ElementSnapshotNode } from '../../types';
import { walkElements } from '../walk';

const tree: ElementSnapshotNode[] = [
	{
		id: 'root',
		elType: 'container',
		settings: { content_width: 'boxed' },
		elements: [
			{
				id: 'inner',
				elType: 'container',
				settings: { content_width: 'boxed' },
				elements: [
					{ id: 'h1', elType: 'widget', widgetType: 'heading', settings: { level: 'h1' }, elements: [] },
				],
			},
			{ id: 'img', elType: 'widget', widgetType: 'image', settings: { alt: '' }, elements: [] },
		],
	},
];

describe( 'walkElements', () => {
	it( 'visits every node depth-first', () => {
		// Arrange.
		const ids: string[] = [];

		// Act.
		walkElements( tree, ( node ) => {
			ids.push( node.id );
		} );

		// Assert.
		expect( ids ).toEqual( [ 'root', 'inner', 'h1', 'img' ] );
	} );

	it( 'collects nodes matching a predicate via the returned array', () => {
		// Arrange.
		const matches: ElementSnapshotNode[] = [];

		// Act.
		walkElements( tree, ( node ) => {
			if ( node.elType === 'widget' && node.widgetType === 'heading' ) {
				matches.push( node );
			}
		} );

		// Assert.
		expect( matches.map( ( n ) => n.id ) ).toEqual( [ 'h1' ] );
	} );

	it( 'exposes the parent chain to the visitor', () => {
		// Arrange.
		const parentIdsFor: Record< string, string[] > = {};

		// Act.
		walkElements( tree, ( node, parents ) => {
			parentIdsFor[ node.id ] = parents.map( ( p ) => p.id );
		} );

		// Assert.
		expect( parentIdsFor.h1 ).toEqual( [ 'root', 'inner' ] );
		expect( parentIdsFor.root ).toEqual( [] );
	} );
} );

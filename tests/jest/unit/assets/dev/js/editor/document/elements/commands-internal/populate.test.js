import { createContainer, mockElementsComponent } from '../mock/component';

describe( "$e.internal( 'document/elements/populate' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should populate a non-existing document in the elements state', () => {
		// Act.
		$e.internal( 'document/elements/populate', {
			documentId: 1,
			elements: [
				{
					id: 'element1',
					elements: [],
				},
				{
					id: 'element2',
					elements: [
						{
							id: 'child1',
							elements: [],
						},
						{
							id: 'child2',
							elements: [],
						},
					],
				},
			],
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'element1', 'element2' ],
				},
				element1: {
					id: 'element1',
					elements: [],
				},
				element2: {
					id: 'element2',
					elements: [ 'child1', 'child2' ],
				},
				child1: {
					id: 'child1',
					elements: [],
				},
				child2: {
					id: 'child2',
					elements: [],
				},
			},
		} );
	} );

	it( 'Should override the state of an existing document in the elements state', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [ {
					id: 'initial',
					settings: {},
					elements: [],
				} ],
			} )
		);

		// Act.
		$e.internal( 'document/elements/populate', {
			documentId: 1,
			elements: [ {
				id: 'element1',
				elements: [],
			} ],
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'element1' ],
				},
				element1: {
					id: 'element1',
					elements: [],
				},
			},
		} );
	} );
} );

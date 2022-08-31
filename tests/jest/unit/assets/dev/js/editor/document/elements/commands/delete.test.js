import { createContainer, mockElementsComponent } from '../mock/component';

describe( "$e.run( 'document/elements/delete' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should delete an element from the elements state recursively', () => {
		// Arrange.
		const container = createContainer( {
			id: 'parent',
			parent: {
				id: 'document',
			},
		} );

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [
					{
						id: 'element-that-should-stay',
						elements: [],
					},
					{
						id: 'parent',
						elements: [ {
							id: 'child',
							elements: [],
						} ],
					},
				],
			} ),
		);

		// Act.
		$e.run( 'document/elements/delete', {
			container,
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'element-that-should-stay' ],
				},
				'element-that-should-stay': {
					id: 'element-that-should-stay',
					elements: [],
				},
			},
		} );
	} );

	it( 'Should not delete anything when and element does not exist in the elements state', () => {
		// Arrange.
		const container = createContainer( {
			id: 'non-existing',
			parent: {
				id: 'document',
			},
		} );

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [ {
					id: 'element',
					elements: [],
				} ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/delete', {
			container,
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'element' ],
				},
				element: {
					id: 'element',
					elements: [],
				},
			},
		} );
	} );
} );

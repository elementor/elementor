import { mockElementsComponent } from '../mock/component';

describe( "$e.run( 'document/elements/empty' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should empty a document in the elements state', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [ {
					id: 'element',
					elements: [],
				} ],
			} ),
		);

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 2,
				elements: [ {
					id: 'element',
					elements: [],
				} ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/empty', {
			force: true,
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [],
				},
			},
			2: {
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

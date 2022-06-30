import { mockElementsComponent } from '../mock/component';

let Document;

describe( "$e.internal( 'document/elements/populate' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();

		Document = ( await import( 'elementor-editor/components/documents/document' ) ).default;

		global.elementor.initElements = jest.fn();
	} );

	it( 'Should fail with an invalid Document', () => {
		// Act & Assert.
		expect( () => {
			$e.internal( 'document/elements/populate', {
				document: {},
				elements: [],
			} );
		} ).toThrow( 'document invalid instance' );
	} );

	it( 'Should initialize Marionette views', () => {
		// Arrange.
		const document = new Document( 1 );

		// Act.
		$e.internal( 'document/elements/populate', {
			document,
			elements: [],
		} );

		// Assert.
		expect( elementor.initElements ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'Should populate a non-existing document in the elements state', () => {
		// Act.
		$e.internal( 'document/elements/populate', {
			document: new Document( { id: 1 } ),
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
							elements: [
								{
									id: 'grandchild',
									elements: [
										{
											id: 'great-grandchild',
											elements: [],
										},
									],
								},
							],
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
					elements: [ 'grandchild' ],
				},
				child2: {
					id: 'child2',
					elements: [],
				},
				grandchild: {
					id: 'grandchild',
					elements: [ 'great-grandchild' ],
				},
				'great-grandchild': {
					id: 'great-grandchild',
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
			} ),
		);

		// Act.
		$e.internal( 'document/elements/populate', {
			document: new Document( { id: 1 } ),
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

	it( 'Should not change the state of other documents in the elements state', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [ {
					id: 'initial1',
					elements: [],
				} ],
			} ),
		);

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 2,
				elements: [ {
					id: 'initial2',
					elements: [],
				} ],
			} ),
		);

		// Act.
		$e.internal( 'document/elements/populate', {
			document: new Document( { id: 3 } ),
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
					elements: [ 'initial1' ],
				},
				initial1: {
					id: 'initial1',
					elements: [],
				},
			},
			2: {
				document: {
					id: 'document',
					elements: [ 'initial2' ],
				},
				initial2: {
					id: 'initial2',
					elements: [],
				},
			},
			3: {
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

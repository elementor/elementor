import { createContainer, mockElementsComponent } from '../mock/component';

describe( "$e.run( 'document/elements/create' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should add new elements to the elements state recursively', () => {
		// Arrange.
		const container = createContainer( {
			id: 'document',
		} );

		// Act.
		$e.run( 'document/elements/create', {
			container,
			model: {
				id: 'parent',
				settings: { test_setting: 'test' },
				elements: [
					{
						id: 'child1',
						settings: { test_setting_2: 'test_2' },
						elements: [],
					},

					{
						id: 'child2',
						settings: { test_setting_3: 'test_3' },
						elements: [],
					},
				],
			},
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'parent' ],
				},
				parent: {
					id: 'parent',
					settings: { test_setting: 'test' },
					elements: [ 'child1', 'child2' ],
				},
				child1: {
					id: 'child1',
					settings: { test_setting_2: 'test_2' },
					elements: [],
				},
				child2: {
					id: 'child2',
					settings: { test_setting_3: 'test_3' },
					elements: [],
				},
			},
		} );
	} );

	it( 'Should add the element in a specific index to the elements state', () => {
		// Arrange.
		const container = createContainer( {
			id: 'document',
		} );

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
		$e.run( 'document/elements/create', {
			container,
			model: {
				id: 'new-element',
				settings: {},
				elements: [],
			},
			options: {
				at: 0,
			},
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'new-element', 'initial' ],
				},
				initial: {
					id: 'initial',
					settings: {},
					elements: [],
				},
				'new-element': {
					id: 'new-element',
					settings: {},
					elements: [],
				},
			},
		} );
	} );

	it( 'Should not affect existing documents/elements in the elements state', () => {
		// Arrange.
		const container = createContainer( {
			id: 'document',
		} );

		// Populate the active document.
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

		// Populate another document.
		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 2,
				elements: [ {
					id: 'initial',
					settings: {},
					elements: [],
				} ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/create', {
			container,
			model: {
				id: 'new-element',
				settings: {},
				elements: [],
			},
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements' ) ).toEqual( {
			1: {
				document: {
					id: 'document',
					elements: [ 'initial', 'new-element' ],
				},
				initial: {
					id: 'initial',
					settings: {},
					elements: [],
				},
				'new-element': {
					id: 'new-element',
					settings: {},
					elements: [],
				},
			},
			2: {
				document: {
					id: 'document',
					elements: [ 'initial' ],
				},
				initial: {
					id: 'initial',
					settings: {},
					elements: [],
				},
			},
		} );
	} );
} );

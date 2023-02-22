import { createContainer, mockElementsComponent } from '../mock/component';

describe( "$e.internal( 'document/elements/set-settings' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should change the settings of an existing element in the elements state', () => {
		// Arrange.
		const container = createContainer( { id: 'element1' } );

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [ {
					id: 'element1',
					settings: {
						setting_that_should_stay: 'test',
						setting_that_should_change: 'old',
					},
					elements: [],
				} ],
			} ),
		);

		// Act.
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				new_setting: 'test',
				setting_that_should_change: 'new',
			},
			options: {
				render: false,
				renderUI: false,
			},
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
					settings: {
						setting_that_should_stay: 'test',
						setting_that_should_change: 'new',
						new_setting: 'test',
					},
					elements: [],
				},
			},
		} );
	} );

	it( 'Should not change the settings if the element does not exist in the elements state', () => {
		// Arrange.
		const container = createContainer( { id: 'non-existing-element' } );

		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [ {
					id: 'element1',
					settings: {
						test: 'test',
					},
					elements: [],
				} ],
			} ),
		);

		// Act.
		$e.internal( 'document/elements/set-settings', {
			container,
			settings: {
				new_setting: 'test',
			},
			options: {
				render: false,
				renderUI: false,
			},
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
					settings: {
						test: 'test',
					},
					elements: [],
				},
			},
		} );
	} );
} );

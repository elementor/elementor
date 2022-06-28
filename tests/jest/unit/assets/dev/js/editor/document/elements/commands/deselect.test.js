import { mockElementsComponent } from '../mock/component';

describe( "$e.run( 'document/elements/deselect' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should deselect a single container', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/deselect', {
			container: { id: 'widget-1' },
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [ 'container-1' ] );
	} );

	it( 'Should deselect multiple containers', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1', 'widget-2', 'container-2' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/deselect', {
			containers: [
				{ id: 'widget-1' },
				{ id: 'widget-2' },
			],
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [ 'container-1', 'container-2' ] );
	} );
} );

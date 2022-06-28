import { mockElementsComponent } from '../mock/component';

describe( "$e.run( 'document/elements/toggle-selection' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should select unselected elements', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.deselectAll(),
		);

		// Act.
		$e.run( 'document/elements/toggle-selection', {
			container: { id: 'container-1' },
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'container-1',
		] );
	} );
} );

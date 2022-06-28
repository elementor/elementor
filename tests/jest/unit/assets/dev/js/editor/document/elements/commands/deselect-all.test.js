import { mockElementsComponent } from '../mock/component';
import { mockElements } from '../mock/elements';

describe( "$e.run( 'document/elements/deselect-all' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();

		mockElements();
	} );

	it( 'Should reset the selection', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/deselect-all' );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [] );
	} );
} );

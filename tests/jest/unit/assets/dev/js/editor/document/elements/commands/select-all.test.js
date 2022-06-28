import { mockElementsComponent } from '../mock/component';
import { mockElements } from '../mock/elements';

describe( "$e.run( 'document/elements/select-all' )", () => {
	let selectElementMock;

	beforeEach( async () => {
		await mockElementsComponent();

		mockElements();
	} );

	it( 'Should select everything in the page', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.deselectAll(),
		);

		// Act.
		$e.run( 'document/elements/select-all' );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'container-1',
			'widget-1',
			'widget-2',
			'container-2',
		] );
	} );

	it( 'Should add to selection when something is already selected', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'container-2' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/select-all' );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'container-1',
			'widget-1',
			'widget-2',
			'container-2',
		] );
	} );
} );

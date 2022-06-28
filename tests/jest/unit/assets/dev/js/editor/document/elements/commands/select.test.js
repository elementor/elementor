import { mockElementsComponent } from '../mock/component';

describe( "$e.run( 'document/elements/select' )", () => {
	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should override selection', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'widget-1', 'widget-2' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/select', {
			container: { id: 'container-1' },
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'container-1',
		] );
	} );

	it( 'Should append to selection', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'widget-1', 'widget-2' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/select', {
			container: { id: 'container-1' },
			append: true,
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'widget-1',
			'widget-2',
			'container-1',
		] );
	} );

	it( 'Should not reselect a selected element', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/select', {
			container: { id: 'container-1' },
			append: true,
		} );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'container-1',
			'widget-1',
		] );
	} );
} );

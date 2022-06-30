import { mockElementsComponent } from '../mock/component';
import { mockElements } from '../mock/elements';

describe( "$e.run( 'document/elements/select-all' )", () => {
	let selectElementMock;

	beforeEach( async () => {
		await mockElementsComponent();
	} );

	it( 'Should select everything in the page', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [
					{
						id: 'element-1',
						elements: [],
					},
					{
						id: 'element-2',
						elements: [],
					},
					{
						id: 'element-3',
						elements: [],
					},
				],
			} ),
		);

		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.deselectAll(),
		);

		// Act.
		$e.run( 'document/elements/select-all' );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'element-1',
			'element-2',
			'element-3',
		] );
	} );

	it( 'Should add to selection when something is already selected', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements' ).actions.populate( {
				documentId: 1,
				elements: [
					{
						id: 'element-1',
						elements: [],
					},
					{
						id: 'element-2',
						elements: [],
					},
					{
						id: 'element-3',
						elements: [],
					},
				],
			} ),
		);

		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'element-2' ],
			} ),
		);

		// Act.
		$e.run( 'document/elements/select-all' );

		// Assert.
		expect( $e.store.getState( 'document/elements/selection' ) ).toEqual( [
			'element-1',
			'element-2',
			'element-3',
		] );
	} );
} );

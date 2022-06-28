import { mockElementsComponent } from './mock/component';
import { elementsSelection } from 'elementor-document/elements/selectors';
import { mockElements } from './mock/elements';

describe( 'elementsSelection', () => {
	beforeEach( async () => {
		await mockElementsComponent();
		mockElements();
	} );

	it( 'getElementsIds() -- Should return all elements IDs from the state', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1' ],
			} ),
		);

		// Act.
		const elementsIds = elementsSelection.getElementsIds();

		// Assert.
		expect( elementsIds ).toEqual( [
			'container-1',
			'widget-1',
		] );
	} );

	it( 'getContainers() -- Should return all Containers from the state', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-2' ],
			} ),
		);

		// Act.
		const elementsIds = elementsSelection.getContainers();

		// Assert.
		expect( elementsIds ).toEqual( [
			{
				id: 'container-2',
				type: 'container',
				children: [],
			},
		] );
	} );

	it( 'getContainers() -- Should return fallback', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.deselectAll(),
		);

		// Act.
		const fallback = 'test';
		const elementsIds = elementsSelection.getContainers( fallback );

		// Assert.
		expect( elementsIds ).toEqual( [ fallback ] );
	} );

	it( 'has() -- Should check if an element is selected based on ID', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1' ],
			} ),
		);

		// Act.
		const hasContainer1 = elementsSelection.has( 'container-1' );
		const hasWidget1 = elementsSelection.has( 'widget-1' );

		// Assert.
		expect( hasContainer1 ).toBe( true );
		expect( hasWidget1 ).toBe( false );
	} );

	it( 'isSameType() -- Should return true if all are same type', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'container-2' ],
			} ),
		);

		// Act.
		const isSameType = elementsSelection.isSameType();

		// Assert.
		expect( isSameType ).toBe( true );
	} );

	it( 'isSameType() -- Should return false if not all are same type', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1' ],
			} ),
		);

		// Act.
		const isSameType = elementsSelection.isSameType();

		// Assert.
		expect( isSameType ).toBe( false );
	} );

	it( 'isMultiple() -- Should return true if multiple elements are selected', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1', 'widget-1' ],
			} ),
		);

		// Act.
		const isMultiple = elementsSelection.isMultiple();

		// Assert.
		expect( isMultiple ).toBe( true );
	} );

	it( 'isMultiple() -- Should return false if a single element is selected', () => {
		// Arrange.
		$e.store.dispatch(
			$e.store.get( 'document/elements/selection' ).actions.select( {
				elementsIds: [ 'container-1' ],
			} ),
		);

		// Act.
		const isMultiple = elementsSelection.isMultiple();

		// Assert.
		expect( isMultiple ).toBe( false );
	} );
} );

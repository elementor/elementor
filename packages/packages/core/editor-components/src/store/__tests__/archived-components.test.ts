import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';

import type { PublishedComponent } from '../../types';
import { selectArchivedThisSession, selectComponent, selectComponents, slice } from '../store';

const MOCK_COMPONENT_ID = 1;
const MOCK_ARCHIVED_COMPONENT_ID = 2;
const MOCK_SESSION_ARCHIVED_COMPONENT_ID = 3;

const createComponent = ( overrides: Partial< PublishedComponent > = {} ): PublishedComponent => ( {
	id: MOCK_COMPONENT_ID,
	uid: 'component-uid-1',
	name: 'Test Component',
	...overrides,
} );

const createArchivedComponent = ( overrides: Partial< PublishedComponent > = {} ): PublishedComponent => ( {
	id: MOCK_ARCHIVED_COMPONENT_ID,
	uid: 'archived-component-uid',
	name: 'Archived Component',
	isArchived: true,
	...overrides,
} );

describe( 'Archived Components Store', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		registerSlice( slice );
		store = __createStore();
	} );

	describe( 'selectComponents', () => {
		it( 'should filter out archived components from the list', () => {
			// Arrange
			const activeComponent = createComponent();
			const archivedComponent = createArchivedComponent();
			dispatch( slice.actions.load( [ activeComponent, archivedComponent ] ) );

			// Act
			const components = selectComponents( store.getState() );

			// Assert
			expect( components ).toHaveLength( 1 );
			expect( components[ 0 ].uid ).toBe( activeComponent.uid );
		} );

		it( 'should include components without isArchived flag', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );

			// Act
			const components = selectComponents( store.getState() );

			// Assert
			expect( components ).toHaveLength( 1 );
			expect( components[ 0 ].uid ).toBe( component.uid );
		} );

		it( 'should return empty array when all components are archived', () => {
			// Arrange
			const archivedComponent = createArchivedComponent();
			dispatch( slice.actions.load( [ archivedComponent ] ) );

			// Act
			const components = selectComponents( store.getState() );

			// Assert
			expect( components ).toHaveLength( 0 );
		} );
	} );

	describe( 'selectComponent', () => {
		it( 'should find non-archived component by ID', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );

			// Act
			const result = selectComponent( store.getState(), MOCK_COMPONENT_ID );

			// Assert
			expect( result ).toBeDefined();
			expect( result?.id ).toBe( MOCK_COMPONENT_ID );
		} );

		it( 'should find archived component from data array by ID', () => {
			// Arrange
			const archivedComponent = createArchivedComponent();
			dispatch( slice.actions.load( [ archivedComponent ] ) );

			// Act
			const result = selectComponent( store.getState(), MOCK_ARCHIVED_COMPONENT_ID );

			// Assert
			expect( result ).toBeDefined();
			expect( result?.id ).toBe( MOCK_ARCHIVED_COMPONENT_ID );
			expect( result?.isArchived ).toBe( true );
		} );

		it( 'should find component archived during session', () => {
			// Arrange
			const component = createComponent( { id: MOCK_SESSION_ARCHIVED_COMPONENT_ID } );
			dispatch( slice.actions.load( [ component ] ) );
			dispatch( slice.actions.archive( MOCK_SESSION_ARCHIVED_COMPONENT_ID ) );

			// Act
			const result = selectComponent( store.getState(), MOCK_SESSION_ARCHIVED_COMPONENT_ID );

			// Assert
			expect( result ).toBeDefined();
			expect( result?.id ).toBe( MOCK_SESSION_ARCHIVED_COMPONENT_ID );
			expect( result?.isArchived ).toBe( true );
		} );

		it( 'should return undefined for non-existent component', () => {
			// Arrange
			dispatch( slice.actions.load( [] ) );

			// Act
			const result = selectComponent( store.getState(), 999 );

			// Assert
			expect( result ).toBeUndefined();
		} );
	} );

	describe( 'archive reducer', () => {
		it( 'should set isArchived flag on component when archived', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );

			// Act
			dispatch( slice.actions.archive( MOCK_COMPONENT_ID ) );

			// Assert
			const result = selectComponent( store.getState(), MOCK_COMPONENT_ID );
			expect( result?.isArchived ).toBe( true );
		} );

		it( 'should keep component in data array after archiving', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );

			// Act
			dispatch( slice.actions.archive( MOCK_COMPONENT_ID ) );

			// Assert
			const state = store.getState();
			expect( state.components.data ).toHaveLength( 1 );
			expect( state.components.data[ 0 ].id ).toBe( MOCK_COMPONENT_ID );
		} );
	} );

	describe( 'selectComponentsArchivedThisSession', () => {
		it( 'should return components archived during session', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );
			dispatch( slice.actions.archive( MOCK_COMPONENT_ID ) );

			// Act
			const archivedComponents = selectArchivedThisSession( store.getState() );

			// Assert
			expect( archivedComponents ).toHaveLength( 1 );
			expect( archivedComponents[ 0 ] ).toBe( MOCK_COMPONENT_ID );
		} );

		it( 'should not include components that were already archived on load', () => {
			// Arrange
			const archivedComponent = createArchivedComponent();
			dispatch( slice.actions.load( [ archivedComponent ] ) );

			// Act
			const archivedComponents = selectArchivedThisSession( store.getState() );

			// Assert
			expect( archivedComponents ).toHaveLength( 0 );
		} );
	} );

	describe( 'setOverridableProps reducer', () => {
		it( 'should update overridable props for component in data array', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );
			const overridableProps = {
				props: {},
				groups: { items: {}, order: [] },
			};

			// Act
			dispatch(
				slice.actions.setOverridableProps( {
					componentId: MOCK_COMPONENT_ID,
					overridableProps,
				} )
			);

			// Assert
			const result = selectComponent( store.getState(), MOCK_COMPONENT_ID );
			expect( result?.overridableProps ).toEqual( overridableProps );
		} );

		it( 'should update overridable props for archived component', () => {
			// Arrange
			const component = createComponent();
			dispatch( slice.actions.load( [ component ] ) );
			dispatch( slice.actions.archive( MOCK_COMPONENT_ID ) );
			const overridableProps = {
				props: {},
				groups: { items: {}, order: [] },
			};

			// Act
			dispatch(
				slice.actions.setOverridableProps( {
					componentId: MOCK_COMPONENT_ID,
					overridableProps,
				} )
			);

			// Assert
			const result = selectComponent( store.getState(), MOCK_COMPONENT_ID );
			expect( result?.overridableProps ).toEqual( overridableProps );
		} );
	} );
} );

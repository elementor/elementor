import * as React from 'react';
import { renderWithStore, renderWithTheme } from 'test-utils';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { jest } from '@jest/globals';
import { act, fireEvent, screen } from '@testing-library/react';

import { slice } from '../../store/store';
import { loadComponents } from '../../store/thunks';
import { ComponentSearch } from '../components-tab/component-search';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { SearchProvider } from '../components-tab/search-provider';

jest.mock( '@elementor/editor-canvas', () => ( {
	startDragElementFromPanel: jest.fn(),
	endDragElementFromPanel: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	dropElement: jest.fn(),
} ) );

jest.mock( '../../utils/get-container-for-new-element', () => ( {
	getContainerForNewElement: jest.fn( () => ( {
		container: { id: 'test-container' },
		options: { useHistory: false, scrollIntoView: true },
	} ) ),
} ) );

jest.mock( '../create-component-form/utils/replace-element-with-component', () => ( {
	createComponentModel: jest.fn( ( { id, name } ) => ( { id, name, elType: 'component' } ) ),
} ) );

const mockComponents = [
	{ id: 1, name: 'Button Component' },
	{ id: 2, name: 'Text Component' },
	{ id: 3, name: 'Image Component' },
	{ id: 4, name: 'Test Component 1' },
	{ id: 5, name: 'Test Component 2' },
	{ id: 6, name: 'Valid Component' },
];

describe( 'ComponentsTab', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.useFakeTimers();
		registerSlice( slice );
		store = __createStore();
	} );

	afterEach( () => {
		if ( jest.isMockFunction( setTimeout ) ) {
			jest.runOnlyPendingTimers();
			jest.clearAllTimers();
			jest.useRealTimers();
		}
	} );

	describe( 'ComponentsList', () => {
		it( 'should render loading state when components are loading', () => {
			// Arrange
			act( () => {
				dispatch( loadComponents.pending( '', undefined ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByLabelText( 'Loading components' ) ).toBeInTheDocument();
		} );

		it( 'should render empty state when no components exist', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( [] ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Text that explains that there are no Components yet.' ) ).toBeInTheDocument();
		} );

		it( 'should render components list when components exist', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test Component 1' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Test Component 2' ) ).toBeInTheDocument();
			expect(
				screen.queryByText( 'Text that explains that there are no Components yet.' )
			).not.toBeInTheDocument();
		} );

		it( 'should render component item with draggable attributes and actions', () => {
			// Arrange
			const buttonComponent = mockComponents[ 0 ];

			// Act
			renderWithTheme( <ComponentItem component={ buttonComponent } /> );

			// Assert
			const componentItem = screen.getByRole( 'button', { name: /Button Component/ } );
			expect( componentItem ).toBeInTheDocument();
			expect( componentItem ).toHaveAttribute( 'draggable', 'true' );
		} );

		it( 'should render search input with correct attributes and placeholder', () => {
			// Act
			renderWithTheme(
				<SearchProvider localStorageKey="test-search">
					<ComponentSearch />
				</SearchProvider>
			);

			// Assert
			expect( screen.getByRole( 'search' ) ).toBeInTheDocument();
			expect( screen.getByPlaceholderText( 'Search' ) ).toBeInTheDocument();
		} );

		it( 'should handle search functionality and show filtered results', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentSearch />
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Text Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Image Component' ) ).toBeInTheDocument();

			// Act
			const searchInput = screen.getByPlaceholderText( 'Search' );
			fireEvent.change( searchInput, { target: { value: 'Button' } } );

			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Text Component' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Image Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should show empty search result when no matches found', () => {
			// Arrange
			act( () => {
				dispatch( slice.actions.load( mockComponents ) );
			} );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentSearch />
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Act
			const searchInput = screen.getByPlaceholderText( 'Search' );
			fireEvent.change( searchInput, { target: { value: 'NonExistent' } } );

			act( () => {
				jest.advanceTimersByTime( 300 );
			} );

			// Assert
			expect( screen.getByText( 'Sorry, nothing matched' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Try something else.' ) ).toBeInTheDocument();
		} );
	} );
} );

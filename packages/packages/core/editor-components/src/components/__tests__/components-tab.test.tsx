import * as React from 'react';
import { renderWithStore, renderWithTheme } from 'test-utils';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';
import { jest } from '@jest/globals';
import { fireEvent, screen } from '@testing-library/react';

import { slice } from '../../store';
import { ComponentSearch } from '../components-tab/component-search';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { SearchProvider } from '../components-tab/search-provider';

// Mock external dependencies
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

jest.mock( '../../hooks/use-components', () => ( {
	useComponents: jest.fn(),
} ) );

const mockUseComponents = jest.mocked( require( '../../hooks/use-components' ).useComponents );

describe( 'ComponentsTab', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		jest.clearAllMocks();
		registerSlice( slice );
		store = createStore();
		mockUseComponents.mockReturnValue( [] );
	} );

	describe( 'ComponentsList', () => {
		it( 'should render loading state when components are loading', () => {
			// Arrange
			mockUseComponents.mockReturnValue( null );

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

		it( 'should render empty state when no components exist', () => {
			// Arrange
			mockUseComponents.mockReturnValue( [] );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'Text that explains that there are no Components yet.' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Once you have Components, this is where you can manage them—rearrange, duplicate, rename and delete irrelevant classes.'
				)
			).toBeInTheDocument();
			expect(
				screen.getByText( 'To create a component, first design it, then choose one of three options:' )
			).toBeInTheDocument();
		} );

		it( 'should render empty search result when search has no matches', () => {
			// Arrange
			mockUseComponents.mockReturnValue( [] );

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
			const mockComponents = [
				{ id: 1, name: 'Test Component 1' },
				{ id: 2, name: 'Test Component 2' },
			];
			mockUseComponents.mockReturnValue( mockComponents );

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

		it( 'should filter components based on search value', () => {
			// Arrange
			const mockComponents = [
				{ id: 1, name: 'Button Component' },
				{ id: 2, name: 'Text Component' },
				{ id: 3, name: 'Image Component' },
			];
			mockUseComponents.mockReturnValue( mockComponents );

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

		it( 'should render component item with name and actions', () => {
			// Arrange
			const mockComponent = { id: 1, name: 'Test Component' };

			// Act
			renderWithTheme( <ComponentItem component={ mockComponent } /> );

			// Assert
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'More actions' ) ).toBeInTheDocument();
		} );

		it( 'should open menu when more actions button is clicked', () => {
			// Arrange
			const mockComponent = { id: 1, name: 'Test Component' };

			// Act
			renderWithTheme( <ComponentItem component={ mockComponent } /> );

			const moreActionsButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreActionsButton );

			// Assert
			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );

		it( 'should render draggable component item', () => {
			// Arrange
			const mockComponent = { id: 1, name: 'Test Component' };

			// Act
			renderWithTheme( <ComponentItem component={ mockComponent } /> );

			// Assert
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'More actions' ) ).toBeInTheDocument();
		} );

		it( 'should render component item with clickable area', () => {
			// Arrange
			const mockComponent = { id: 1, name: 'Test Component' };

			// Act
			renderWithTheme( <ComponentItem component={ mockComponent } /> );

			// Assert
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
		} );

		it( 'should render search input with placeholder', () => {
			// Arrange
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

		it( 'should render search input with correct attributes', () => {
			// Arrange
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
	} );
} );

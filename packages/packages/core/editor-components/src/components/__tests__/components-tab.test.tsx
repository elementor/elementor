import * as React from 'react';
import { ThemeProvider } from '@elementor/editor-ui';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { useComponents } from '../../hooks/use-components';
import { type Component } from '../../types';
import { ComponentSearch } from '../components-tab/component-search';
import { Components } from '../components-tab/components';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { LoadingComponents } from '../components-tab/loading-components';
import { SearchProvider, useSearch } from '../components-tab/search-provider';

jest.mock( '../../hooks/use-components' );
jest.mock( '@elementor/editor-canvas', () => ( {
	startDragElementFromPanel: jest.fn(),
	endDragElementFromPanel: jest.fn(),
} ) );
jest.mock( '@elementor/editor-elements', () => ( {
	dropElement: jest.fn(),
} ) );
jest.mock( '../create-component-form/utils/replace-element-with-component', () => ( {
	createComponentModel: jest.fn( ( { id, name } ) => ( { id, name, type: 'component' } ) ),
} ) );
jest.mock( '../../utils/get-container-for-new-element', () => ( {
	getContainerForNewElement: jest.fn( () => ( {
		container: { id: 'test-container' },
		options: { useHistory: false, scrollIntoView: true },
	} ) ),
} ) );

const mockUseComponents = useComponents as jest.MockedFunction< typeof useComponents >;

const mockComponents: Component[] = [
	{ id: 1, name: 'Header Component' },
	{ id: 2, name: 'Footer Component' },
	{ id: 3, name: 'Navigation Menu' },
	{ id: 4, name: 'Hero Section' },
];

const TestWrapper = ( { children }: { children: React.ReactNode } ) => (
	<ThemeProvider>
		<SearchProvider localStorageKey="test-components-search">{ children }</SearchProvider>
	</ThemeProvider>
);

describe( 'Components Tab', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Components', () => {
		it( 'should render the main Components component with search and list', () => {
			// Arrange
			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
				error: null,
			} as never );

			// Act
			render(
				<TestWrapper>
					<Components />
				</TestWrapper>
			);

			// Assert
			expect( screen.getByRole( 'search' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Footer Component' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'ComponentSearch', () => {
		it( 'should render search input', () => {
			// Act
			render(
				<TestWrapper>
					<ComponentSearch />
				</TestWrapper>
			);

			// Assert
			const searchInput = screen.getByRole( 'search' );
			expect( searchInput ).toBeInTheDocument();
		} );

		it( 'should update search value when user types', () => {
			// Arrange
			render(
				<TestWrapper>
					<ComponentSearch />
				</TestWrapper>
			);

			const input = screen.getByRole( 'textbox' );

			// Act
			fireEvent.change( input, { target: { value: 'header' } } );

			// Assert
			expect( input ).toHaveValue( 'header' );
		} );
	} );

	describe( 'ComponentsList', () => {
		it( 'should render loading state when isLoading is true', () => {
			// Arrange
			mockUseComponents.mockReturnValue( {
				data: undefined,
				isLoading: true,
				error: null,
			} as never );

			// Act
			render(
				<TestWrapper>
					<ComponentsList />
				</TestWrapper>
			);

			// Assert
			expect( screen.getByLabelText( 'Loading components' ) ).toBeInTheDocument();
		} );

		it( 'should render components list when data is available', () => {
			// Arrange
			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
				error: null,
			} as never );

			// Act
			render(
				<TestWrapper>
					<ComponentsList />
				</TestWrapper>
			);

			// Assert
			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Footer Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Navigation Menu' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Hero Section' ) ).toBeInTheDocument();
		} );

		it( 'should render empty state when no components exist', () => {
			// Arrange
			mockUseComponents.mockReturnValue( {
				data: [],
				isLoading: false,
				error: null,
			} as never );

			// Act
			render(
				<TestWrapper>
					<ComponentsList />
				</TestWrapper>
			);

			// Assert
			expect( screen.getByText( 'Text that explains that there are no Components yet.' ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					'Once you have Components, this is where you can manage them—rearrange, duplicate, rename and delete irrelevant classes.'
				)
			).toBeInTheDocument();
		} );
	} );

	describe( 'ComponentItem', () => {
		const mockComponent: Component = { id: 1, name: 'Test Component' };

		it( 'should render component item with name and icon', () => {
			// Act
			render(
				<TestWrapper>
					<ComponentItem component={ mockComponent } />
				</TestWrapper>
			);

			// Assert
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
			expect( screen.getByLabelText( 'More actions' ) ).toBeInTheDocument();
		} );

		it( 'should be draggable', () => {
			// Act
			render(
				<TestWrapper>
					<ComponentItem component={ mockComponent } />
				</TestWrapper>
			);

			// Assert
			const draggableElement = screen.getByRole( 'button', { name: /test component/i } );
			expect( draggableElement ).toHaveAttribute( 'draggable', 'true' );
		} );

		it( 'should open menu when more actions button is clicked', () => {
			// Arrange
			render(
				<TestWrapper>
					<ComponentItem component={ mockComponent } />
				</TestWrapper>
			);

			const moreActionsButton = screen.getByLabelText( 'More actions' );

			// Act
			fireEvent.click( moreActionsButton );

			// Assert
			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );

		it( 'should close menu when delete is clicked', async () => {
			// Arrange
			render(
				<TestWrapper>
					<ComponentItem component={ mockComponent } />
				</TestWrapper>
			);

			const moreActionsButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreActionsButton );

			const deleteButton = screen.getByText( 'Delete' );

			// Act
			fireEvent.click( deleteButton );

			// Assert
			await waitFor( () => {
				expect( screen.queryByText( 'Rename' ) ).not.toBeInTheDocument();
			} );
		} );
	} );

	describe( 'LoadingComponents', () => {
		it( 'should render loading skeleton with correct number of rows', () => {
			// Act
			render( <LoadingComponents /> );

			// Assert
			const skeletons = screen.getAllByRole( 'button' );
			expect( skeletons ).toHaveLength( 6 );
		} );

		it( 'should have proper accessibility label', () => {
			// Act
			render( <LoadingComponents /> );

			// Assert
			expect( screen.getByLabelText( 'Loading components' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'SearchProvider', () => {
		it( 'should provide search context to children', () => {
			// Arrange
			const TestComponent = () => {
				const { inputValue, handleChange } = useSearch();
				return (
					<div>
						<input value={ inputValue } onChange={ ( e ) => handleChange( e.target.value ) } />
						<span>{ inputValue }</span>
					</div>
				);
			};

			render(
				<SearchProvider localStorageKey="test-key">
					<TestComponent />
				</SearchProvider>
			);

			const input = screen.getByRole( 'textbox' );

			// Act
			fireEvent.change( input, { target: { value: 'test search' } } );

			// Assert
			expect( screen.getByText( 'test search' ) ).toBeInTheDocument();
		} );

		it( 'should provide clearSearch function', () => {
			// Arrange
			const TestComponent = () => {
				const { inputValue, handleChange, clearSearch } = useSearch();
				return (
					<div>
						<input value={ inputValue } onChange={ ( e ) => handleChange( e.target.value ) } />
						<button onClick={ clearSearch }>Clear</button>
						<span>{ inputValue }</span>
					</div>
				);
			};

			render(
				<SearchProvider localStorageKey="test-key">
					<TestComponent />
				</SearchProvider>
			);

			const input = screen.getByRole( 'textbox' );
			const clearButton = screen.getByText( 'Clear' );

			fireEvent.change( input, { target: { value: 'test search' } } );
			expect( screen.getByText( 'test search' ) ).toBeInTheDocument();

			// Act
			fireEvent.click( clearButton );

			// Assert
			expect( input ).toHaveValue( '' );
		} );
	} );
} );

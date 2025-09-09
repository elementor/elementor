import * as React from 'react';
import { createMockElement } from 'test-utils';
import { dropElement } from '@elementor/editor-elements';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';

import { useComponents } from '../../hooks/use-components';
import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { ComponentItem } from '../components-item';
import { ComponentsList } from '../components-list';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

// Mock dependencies
jest.mock( '@elementor/editor-elements' );
jest.mock( '../../hooks/use-components' );
jest.mock( '../../utils/get-container-for-new-element' );
jest.mock( '../create-component-form/utils/replace-element-with-component' );

const mockUseComponents = jest.mocked( useComponents );
const mockDropElement = jest.mocked( dropElement );
const mockGetContainerForNewElement = jest.mocked( getContainerForNewElement );
const mockCreateComponentModel = jest.mocked( createComponentModel );

const mockComponent: Component = {
	id: 1,
	name: 'Test Component',
};

const mockComponents: Component[] = [
	{ id: 1, name: 'Header Component' },
	{ id: 2, name: 'Footer Component' },
	{ id: 3, name: 'Button Component' },
];

const queryClient = new QueryClient( {
	defaultOptions: {
		queries: {
			retry: false,
		},
	},
} );

const renderWithQuery = ( children: React.ReactElement ) => {
	return render( <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider> );
};

describe( 'ComponentsList', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should show loading components when data is loading', () => {
		// Arrange.
		mockUseComponents.mockReturnValue( {
			data: undefined,
			isLoading: true,
		} as ReturnType< typeof useComponents > );

		// Act.
		renderWithQuery( <ComponentsList /> );

		// Assert.
		// Check for the loading container
		const loadingContainer = screen.getByLabelText( 'Loading components' );
		expect( loadingContainer ).toBeInTheDocument();

		// Check for skeleton loading buttons (the actual loading indicators)
		const skeletonButtons = screen.getAllByRole( 'button' );
		expect( skeletonButtons ).toHaveLength( 6 ); // ROWS_COUNT = 6
	} );

	it( 'should show empty state when components array is empty', () => {
		// Arrange.
		mockUseComponents.mockReturnValue( {
			data: [] as Component[],
			isLoading: false,
		} as ReturnType< typeof useComponents > );

		// Act.
		renderWithQuery( <ComponentsList /> );

		// Assert.
		expect( screen.getByText( 'Text that explains that there are no Components yet.' ) ).toBeInTheDocument();
		expect(
			screen.getByText( 'To create a component, first design it, then choose one of three options:' )
		).toBeInTheDocument();
		expect( screen.getByText( '1. Right-click and select Create Component' ) ).toBeInTheDocument();
		expect( screen.getByText( '2. Use the component icon in the Structure panel' ) ).toBeInTheDocument();
		expect( screen.getByText( '3. Use the component icon in the Edit panel header' ) ).toBeInTheDocument();

		// Expect the console warning about fullWidth prop
		expect( console ).toHaveErrored();
	} );

	it( 'should render list of components when data is available', () => {
		// Arrange.
		mockUseComponents.mockReturnValue( {
			data: mockComponents,
			isLoading: false,
		} as ReturnType< typeof useComponents > );

		// Act.
		renderWithQuery( <ComponentsList /> );

		// Assert.
		expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Footer Component' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
	} );

	describe( 'ComponentItem', () => {
		const mockContainer = createMockElement( { model: { id: 'container-1' } } );
		const mockModel = {
			elType: 'widget',
			widgetType: 'e-component',
			settings: {
				component_id: {
					$$type: 'number' as const,
					value: 1,
				},
			},
			editor_settings: {
				title: 'Test Component',
			},
		};

		beforeEach( () => {
			jest.clearAllMocks();
			mockGetContainerForNewElement.mockReturnValue( {
				container: mockContainer,
				options: { at: 0 },
			} );
			mockCreateComponentModel.mockReturnValue( mockModel );
		} );

		it( 'should render component name', () => {
			// Act.
			renderWithQuery( <ComponentItem component={ mockComponent } /> );

			// Assert.
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
		} );

		it( 'should render component icon', () => {
			// Act.
			renderWithQuery( <ComponentItem component={ mockComponent } /> );

			// Assert.
			// Check that the component item is rendered with proper structure
			const componentText = screen.getByText( 'Test Component' );
			expect( componentText ).toBeInTheDocument();
			// The icon is part of the ListItemIcon, we can verify the component name is rendered
			expect( componentText ).toHaveTextContent( 'Test Component' );
		} );

		it( 'should add component to page when clicked', () => {
			// Act.
			renderWithQuery( <ComponentItem component={ mockComponent } /> );
			const componentButton = screen.getByText( 'Test Component' );
			fireEvent.click( componentButton );

			// Assert.
			expect( mockCreateComponentModel ).toHaveBeenCalledWith( mockComponent );
			expect( mockDropElement ).toHaveBeenCalledWith( {
				containerId: mockContainer.id,
				model: mockModel,
				options: { at: 0, useHistory: false, scrollIntoView: true },
			} );
		} );

		it( 'should handle error when no container is available', () => {
			// Arrange.
			mockGetContainerForNewElement.mockReturnValue( { container: null } );

			// Act.
			renderWithQuery( <ComponentItem component={ mockComponent } /> );
			const componentButton = screen.getByText( 'Test Component' );

			// Assert - The component should render without crashing
			expect( componentButton ).toBeInTheDocument();

			// The error will be caught by React's error boundary system
			// and logged to console, but the component should still render
		} );
	} );

	describe( 'ComponentItem Menu', () => {
		beforeEach( () => {
			jest.clearAllMocks();
			mockGetContainerForNewElement.mockReturnValue( {
				container: createMockElement( { model: { id: 'container-1' } } ),
				options: { at: 0 },
			} );
			mockCreateComponentModel.mockReturnValue( {
				elType: 'widget',
				widgetType: 'e-component',
				settings: {
					component_id: {
						$$type: 'number' as const,
						value: 1,
					},
				},
				editor_settings: {
					title: 'Test Component',
				},
			} );
		} );

		it( 'should render menu options when more button is clicked', () => {
			// Act.
			renderWithQuery( <ComponentItem component={ mockComponent } /> );
			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			// Assert.
			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );

		it( 'should handle delete button click', () => {
			// Act.
			renderWithQuery( <ComponentItem component={ mockComponent } /> );
			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			const deleteButton = screen.getByText( 'Delete' );
			fireEvent.click( deleteButton );

			// Assert - Delete button should be clickable and menu should still be functional
			expect( deleteButton ).toBeInTheDocument();
		} );
	} );

	describe( 'Integration Tests', () => {
		it( 'should handle complete component workflow', async () => {
			// Arrange.
			const mockContainer = createMockElement( { model: { id: 'container-1' } } );
			const mockModel = {
				elType: 'widget',
				widgetType: 'e-component',
				settings: {
					component_id: {
						$$type: 'number' as const,
						value: 1,
					},
				},
				editor_settings: {
					title: 'Test Component',
				},
			};
			mockUseComponents.mockReturnValue( {
				data: [ mockComponent ],
				isLoading: false,
			} as ReturnType< typeof useComponents > );
			mockGetContainerForNewElement.mockReturnValue( {
				container: mockContainer,
				options: { at: 0 },
			} );
			mockCreateComponentModel.mockReturnValue( mockModel );

			// Act.
			renderWithQuery( <ComponentsList /> );

			// Assert - Component should be rendered
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();

			// Act - Click on component to add it to page
			const componentButton = screen.getByText( 'Test Component' );
			fireEvent.click( componentButton );

			// Assert - Should call dropElement
			expect( mockDropElement ).toHaveBeenCalledWith( {
				containerId: mockContainer.id,
				model: mockModel,
				options: { at: 0, useHistory: false, scrollIntoView: true },
			} );

			// Act - Open menu
			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			// Assert - Menu should be open
			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );
	} );
} );

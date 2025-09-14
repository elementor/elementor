import * as React from 'react';
import { createMockElement } from 'test-utils';
import { dropElement } from '@elementor/editor-elements';
import { useSearch } from '@elementor/utils';
import { fireEvent, render, screen } from '@testing-library/react';

import { useComponents } from '../../hooks/use-components';
import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { Components } from '../components';
import { ComponentItem } from '../components-item';
import { ComponentsList } from '../components-list';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../hooks/use-components' );
jest.mock( '../../utils/get-container-for-new-element' );
jest.mock( '../create-component-form/utils/replace-element-with-component' );
jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	useSearch: jest.fn(),
} ) );

const mockUseComponents = jest.mocked( useComponents );
const mockDropElement = jest.mocked( dropElement );
const mockGetContainerForNewElement = jest.mocked( getContainerForNewElement );
const mockCreateComponentModel = jest.mocked( createComponentModel );
const mockUseSearch = jest.mocked( useSearch );

const mockComponent: Component = {
	id: 1,
	name: 'Test Component',
};

const mockComponents: Component[] = [
	{ id: 1, name: 'Header Component' },
	{ id: 2, name: 'Footer Component' },
	{ id: 3, name: 'Button Component' },
];

describe( 'ComponentsList', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		// Default mock for useSearch - no search active
		mockUseSearch.mockReturnValue( {
			inputValue: '',
			debouncedValue: '',
			handleChange: jest.fn(),
			onClearSearch: jest.fn(),
		} );
	} );

	it( 'should show loading components when data is loading', () => {
		mockUseComponents.mockReturnValue( {
			data: undefined,
			isLoading: true,
		} as ReturnType< typeof useComponents > );

		render( <ComponentsList /> );

		const loadingContainer = screen.getByLabelText( 'Loading components' );
		expect( loadingContainer ).toBeInTheDocument();

		const skeletonButtons = screen.getAllByRole( 'button' );
		expect( skeletonButtons ).toHaveLength( 6 );
	} );

	it( 'should show empty state when components array is empty', () => {
		mockUseComponents.mockReturnValue( {
			data: [] as Component[],
			isLoading: false,
		} as ReturnType< typeof useComponents > );

		render( <ComponentsList /> );

		expect( screen.getByText( 'Text that explains that there are no Components yet.' ) ).toBeInTheDocument();
	} );

	it( 'should render list of components when data is available', () => {
		mockUseComponents.mockReturnValue( {
			data: mockComponents,
			isLoading: false,
		} as ReturnType< typeof useComponents > );

		render( <ComponentsList /> );

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
			render( <ComponentItem component={ mockComponent } /> );

			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
		} );

		it( 'should render component icon', () => {
			render( <ComponentItem component={ mockComponent } /> );

			const componentText = screen.getByText( 'Test Component' );
			expect( componentText ).toBeInTheDocument();
			expect( componentText ).toHaveTextContent( 'Test Component' );
		} );

		it( 'should add component to page when clicked', () => {
			render( <ComponentItem component={ mockComponent } /> );
			const componentButton = screen.getByText( 'Test Component' );
			fireEvent.click( componentButton );

			expect( mockCreateComponentModel ).toHaveBeenCalledWith( mockComponent );
			expect( mockDropElement ).toHaveBeenCalledWith( {
				containerId: mockContainer.id,
				model: mockModel,
				options: { at: 0, useHistory: false, scrollIntoView: true },
			} );
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
			render( <ComponentItem component={ mockComponent } /> );
			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );

		it( 'should handle delete button click', () => {
			render( <ComponentItem component={ mockComponent } /> );
			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			const deleteButton = screen.getByText( 'Delete' );
			fireEvent.click( deleteButton );

			expect( deleteButton ).toBeInTheDocument();
		} );
	} );

	describe( 'Integration Tests', () => {
		it( 'should handle complete component workflow', async () => {
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

			render( <Components /> );

			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();

			const componentButton = screen.getByText( 'Test Component' );
			fireEvent.click( componentButton );

			expect( mockDropElement ).toHaveBeenCalledWith( {
				containerId: mockContainer.id,
				model: mockModel,
				options: { at: 0, useHistory: false, scrollIntoView: true },
			} );

			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );
	} );

	describe( 'Search Tests', () => {
		beforeEach( () => {
			jest.clearAllMocks();
			mockUseSearch.mockReturnValue( {
				inputValue: '',
				debouncedValue: '',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );
		} );

		it( 'should show 1 component based on search value', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: 'header',
				debouncedValue: 'header',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Footer Component' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should show 2 components based on search value', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: 'component',
				debouncedValue: 'component',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Footer Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		} );

		it( 'should show not found message if no match found with search value', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: 'nonexistent',
				debouncedValue: 'nonexistent',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			expect( screen.getByText( 'Sorry, nothing matched' ) ).toBeInTheDocument();
		} );
		it( 'should clean the search', () => {
			const mockOnClearSearch = jest.fn();

			mockUseSearch.mockReturnValue( {
				inputValue: 'nonexistent',
				debouncedValue: 'nonexistent',
				handleChange: jest.fn(),
				onClearSearch: mockOnClearSearch,
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			expect( screen.getByText( 'Sorry, nothing matched' ) ).toBeInTheDocument();

			const clearBtn = screen.getByRole( 'button', { name: /clear & try again/i } );
			fireEvent.click( clearBtn );

			expect( mockOnClearSearch ).toHaveBeenCalled();
		} );

		it( 'should be case insensitive when searching', () => {
			// Mock search with uppercase term
			mockUseSearch.mockReturnValue( {
				inputValue: 'BUTTON',
				debouncedValue: 'BUTTON',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Header Component' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Footer Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should show all components when search is empty', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: '',
				debouncedValue: '',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Footer Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		} );
	} );
} );

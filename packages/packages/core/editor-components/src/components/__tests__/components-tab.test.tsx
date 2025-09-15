import * as React from 'react';
import { createMockElement } from 'test-utils';
import { dropElement } from '@elementor/editor-elements';
import { fireEvent, render, screen } from '@testing-library/react';

import { useComponents } from '../../hooks/use-components';
import { type Component } from '../../types';
import { getContainerForNewElement } from '../../utils/get-container-for-new-element';
import { Components } from '../components-tab/components';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { useSearch } from '../components-tab/search-provider';
import { createComponentModel } from '../create-component-form/utils/replace-element-with-component';

jest.mock( '@elementor/editor-elements' );
jest.mock( '../../hooks/use-components' );
jest.mock( '../../utils/get-container-for-new-element' );
jest.mock( '../create-component-form/utils/replace-element-with-component' );
jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	useSearchState: jest.fn(),
} ) );
jest.mock( '../components-tab/search-provider', () => ( {
	...jest.requireActual( '../components-tab/search-provider' ),
	SearchProvider: ( { children }: { children: React.ReactNode } ) => children,
	useSearch: jest.fn(),
} ) );
jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => children,
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
		mockUseSearch.mockReturnValue( {
			searchValue: '',
			inputValue: '',
			handleChange: jest.fn(),
			onClearSearch: jest.fn(),
		} );
	} );

	it( 'should show loading components when data is loading', () => {
		// Arrange.
		mockUseComponents.mockReturnValue( {
			data: undefined,
			isLoading: true,
		} as ReturnType< typeof useComponents > );

		// Act.
		render( <ComponentsList /> );

		// Assert.
		const loadingContainer = screen.getByLabelText( 'Loading components' );
		expect( loadingContainer ).toBeInTheDocument();

		const skeletonButtons = screen.getAllByRole( 'button' );
		expect( skeletonButtons ).toHaveLength( 6 );
	} );

	it( 'should show empty state when components array is empty', () => {
		// Arrange.
		mockUseComponents.mockReturnValue( {
			data: [] as Component[],
			isLoading: false,
		} as ReturnType< typeof useComponents > );

		// Act.
		render( <ComponentsList /> );

		// Assert.
		expect( screen.getByText( 'Text that explains that there are no Components yet.' ) ).toBeInTheDocument();
	} );

	it( 'should render list of components when data is available', () => {
		// Arrange.
		mockUseComponents.mockReturnValue( {
			data: mockComponents,
			isLoading: false,
		} as ReturnType< typeof useComponents > );

		// Act.
		render( <ComponentsList /> );

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
			// Arrange.
			// Act.
			render( <ComponentItem component={ mockComponent } /> );

			// Assert.
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
		} );

		it( 'should add component to page when clicked', () => {
			// Arrange.
			render( <ComponentItem component={ mockComponent } /> );
			const componentButton = screen.getByText( 'Test Component' );

			// Act.
			fireEvent.click( componentButton );

			// Assert.
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
			// Arrange.
			render( <ComponentItem component={ mockComponent } /> );
			const moreButton = screen.getByLabelText( 'More actions' );

			// Act.
			fireEvent.click( moreButton );

			// Assert.
			expect( screen.getByText( 'Rename' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Delete' ) ).toBeInTheDocument();
		} );

		it( 'should handle delete button click', () => {
			// Arrange.
			render( <ComponentItem component={ mockComponent } /> );

			const moreButton = screen.getByLabelText( 'More actions' );
			fireEvent.click( moreButton );

			const deleteButton = screen.getByText( 'Delete' );

			// Act.
			fireEvent.click( deleteButton );

			// Assert.
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
			mockUseSearch.mockReturnValue( {
				searchValue: '',
				inputValue: '',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );
			render( <Components /> );
			expect( screen.getByText( 'Test Component' ) ).toBeInTheDocument();
			const componentButton = screen.getByText( 'Test Component' );
			fireEvent.click( componentButton );
			expect( mockCreateComponentModel ).toHaveBeenCalledWith( mockComponent );
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
				searchValue: '',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );
		} );

		it( 'should show 1 component based on search value', () => {
			// Arrange.
			mockUseSearch.mockReturnValue( {
				inputValue: 'header',
				searchValue: 'header',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			// Act.
			render( <ComponentsList /> );

			// Assert.
			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Footer Component' ) ).not.toBeInTheDocument();
			expect( screen.queryByText( 'Button Component' ) ).not.toBeInTheDocument();
		} );

		it( 'should show all components when search term matches common part in all names', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: 'component',
				searchValue: 'component',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			} );

			mockUseComponents.mockReturnValue( {
				data: mockComponents,
				isLoading: false,
			} as ReturnType< typeof useComponents > );

			render( <ComponentsList /> );

			const componentElements = screen.getAllByText( /Component$/ );
			expect( componentElements ).toHaveLength( 3 );
			expect( screen.getByText( 'Header Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Footer Component' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Button Component' ) ).toBeInTheDocument();
		} );

		it( 'should show not found message if no match found with search value', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: 'nonexistent',
				searchValue: 'nonexistent',
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
			// Arrange.
			const mockOnClearSearch = jest.fn();

			mockUseSearch.mockReturnValue( {
				inputValue: 'nonexistent',
				searchValue: 'nonexistent',
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

			// Act.
			fireEvent.click( clearBtn );

			// Assert.
			expect( mockOnClearSearch ).toHaveBeenCalled();
		} );

		it( 'should be case insensitive when searching', () => {
			mockUseSearch.mockReturnValue( {
				inputValue: 'BUTTON',
				searchValue: 'BUTTON',
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
				searchValue: '',
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

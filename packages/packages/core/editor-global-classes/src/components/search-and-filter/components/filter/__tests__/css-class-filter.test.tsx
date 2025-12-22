import * as React from 'react';
import { createMockDocument, renderWithStore } from 'test-utils';
import { getCurrentDocument } from '@elementor/editor-documents';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { __createStore as createStore, __registerSlice as registerSlice } from '@elementor/store';
import { fireEvent, screen } from '@testing-library/react';

import { mockTrackGlobalClasses, mockTrackingModule } from '../../../../../__tests__/mocks';
import { useFilteredCssClassUsage } from '../../../../../hooks/use-filtered-css-class-usage';
import { slice } from '../../../../../store';
import { type SearchAndFilterContextType, useSearchAndFilters } from '../../../context';
import { CssClassFilter } from '../css-class-filter';
import { setupMocks } from './test-utils';

jest.mock( '@elementor/editor-documents' );
jest.mock( '../../../context' );
jest.mock( '../../../../../hooks/use-filtered-css-class-usage' );

jest.mock( '../../../../../utils/tracking', () => mockTrackingModule );

describe( 'CssClassFilter', () => {
	let store: ReturnType< typeof createStore >;
	let queryClient: QueryClient;

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getCurrentDocument ).mockReturnValue( createMockDocument( { id: 1 } ) );
		registerSlice( slice );

		store = createStore();
		setupMocks();

		// Mock the filtered usage hook
		jest.mocked( useFilteredCssClassUsage ).mockReturnValue( {
			unused: [],
			empty: [],
			onThisPage: [],
		} );

		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: false,
					empty: false,
					onThisPage: false,
				},
				setFilters: jest.fn(),
				onClearFilter: jest.fn(),
			},
		} );

		// Set up QueryClient
		queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );
	} );

	afterEach( () => {
		queryClient.clear();
	} );

	const renderComponent = () => {
		return renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<CssClassFilter />
			</QueryClientProvider>,
			store
		);
	};

	it( 'should render filter button with tooltip', () => {
		renderComponent();

		expect( screen.getByRole( 'button', { name: /filters/i } ) ).toBeInTheDocument();
	} );

	it( 'should open popover when clicking filter button', async () => {
		renderComponent();

		const button = screen.getByRole( 'button', { name: /filters/i } );
		fireEvent.click( button );

		expect( screen.getByRole( 'presentation' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Filters' ) ).toBeInTheDocument();
		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerFiltersOpened',
		} );
	} );

	it( 'should close popover when clicking close button', async () => {
		renderComponent();

		const button = screen.getByRole( 'button', { name: /filters/i } );
		fireEvent.click( button );

		const clsButton = screen.getByRole( 'button', { name: /close/i } );
		fireEvent.click( clsButton );

		expect( screen.queryByRole( 'presentation' ) ).not.toBeInTheDocument();
	} );

	it( 'should track filter cleared when clicking clear all button in popover', async () => {
		// Arrange
		const mockOnClearFilter = jest.fn();
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			search: {} as SearchAndFilterContextType[ 'search' ],
			filters: {
				filters: {
					unused: true,
					empty: true,
					onThisPage: false,
				},
				setFilters: jest.fn(),
				onClearFilter: mockOnClearFilter,
			},
		} );

		renderComponent();

		const button = screen.getByRole( 'button', { name: /filters/i } );
		fireEvent.click( button );

		const clearButton = screen.getByRole( 'button', { name: /clear all/i } );

		// Act
		fireEvent.click( clearButton );

		// Assert
		expect( mockOnClearFilter ).toHaveBeenCalledWith( 'menu' );
		expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
			event: 'classManagerFilterCleared',
			trigger: 'menu',
		} );
	} );
} );

import * as React from 'react';
import { mockCurrentUserCapabilities, renderWithStore, renderWithTheme } from 'test-utils';
import {
	__createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
	type SliceState,
	type Store,
} from '@elementor/store';
import { act, fireEvent, screen } from '@testing-library/react';

import { slice } from '../../store/store';
import { loadComponents } from '../../store/thunks';
import { ComponentSearch } from '../components-tab/component-search';
import { Components } from '../components-tab/components';
import { ComponentItem } from '../components-tab/components-item';
import { ComponentsList } from '../components-tab/components-list';
import { SearchProvider } from '../components-tab/search-provider';

type ExtendedWindow = Window & {
	elementor?: {
		helpers?: {
			hasPro?: () => boolean;
		};
	};
	elementorPro?: {
		config?: {
			isActive?: boolean;
		};
	};
};

jest.mock( '@elementor/editor-documents', () => ( {
	getV1DocumentsManager: jest.fn(),
	setDocumentModifiedStatus: jest.fn(),
} ) );

jest.mock( '@elementor/editor-mcp', () => ( {
	getAngieSdk: jest.fn().mockImplementation( () => ( {
		isAngieReady: jest.fn( () => false ),
		triggerAngie: jest.fn(),
	} ) ),
} ) );

jest.mock( '@elementor/editor-current-user' );

mockCurrentUserCapabilities( true );

const mockComponents = [
	{ id: 1, name: 'Button Component', uid: 'f73880da-522c-442e-815a-b2c9849b7415' },
	{ id: 2, name: 'Text Component', uid: 'f73880da-522c-442e-815a-b2c9849b7416' },
	{ id: 3, name: 'Image Component', uid: 'f73880da-522c-442e-815a-b2c9849b7417' },
	{ id: 4, name: 'Test Component 1', uid: 'f73880da-522c-442e-815a-b2c9849b7418' },
	{ id: 5, name: 'Test Component 2', uid: 'f73880da-522c-442e-815a-b2c9849b7419' },
	{ id: 6, name: 'Valid Component', uid: 'f73880da-522c-442e-815a-b2c9849b7420' },
	{ id: 7, name: 'ExistingComponent', uid: 'f73880da-522c-442e-815a-b2c9849b7421' },
];

describe( 'ComponentsTab', () => {
	let store: Store< SliceState< typeof slice > >;

	beforeEach( () => {
		jest.useFakeTimers();
		registerSlice( slice );
		store = __createStore();
		act( () => {
			dispatch( slice.actions.load( mockComponents ) );
		} );
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
			expect( screen.getByText( 'No components yet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Learn more about components' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Create your first one:' ) ).toBeInTheDocument();
		} );

		it( 'should render components list when components exist', () => {
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
			expect( screen.queryByText( 'No components yet' ) ).not.toBeInTheDocument();
		} );

		it( 'should render component items as disabled without actions', () => {
			// Act
			renderWithStore( <ComponentItem component={ mockComponents[ 0 ] } />, store );

			// Assert
			const componentItem = screen.getByRole( 'button', { name: /Button Component/ } );
			expect( componentItem ).toBeInTheDocument();
			expect( componentItem ).toHaveAttribute( 'aria-disabled', 'true' );
			expect( componentItem ).not.toHaveAttribute( 'draggable', 'true' );
			expect( screen.queryByLabelText( 'More actions' ) ).not.toBeInTheDocument();
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

		it( 'should render empty state when no components exist and user is not admin', () => {
			// Arrange
			dispatch( slice.actions.load( [] ) );
			mockCurrentUserCapabilities( false );

			// Act
			renderWithStore(
				<SearchProvider localStorageKey="test-search">
					<ComponentsList />
				</SearchProvider>,
				store
			);

			// Assert
			expect( screen.getByText( 'No components yet' ) ).toBeInTheDocument();
			expect( screen.getByText( 'Learn more about components' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'Create your first one:' ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /Create component with AI/i } ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'ComponentsProNotification', () => {
		const extendedWindow = window as unknown as ExtendedWindow;
		let originalElementor: ExtendedWindow[ 'elementor' ];
		let originalElementorPro: ExtendedWindow[ 'elementorPro' ];

		beforeEach( () => {
			originalElementor = extendedWindow.elementor;
			originalElementorPro = extendedWindow.elementorPro;
		} );

		afterEach( () => {
			extendedWindow.elementor = originalElementor;
			extendedWindow.elementorPro = originalElementorPro;
		} );

		it( 'should render notification for Core users without Pro when components exist', () => {
			// Arrange
			extendedWindow.elementor = {
				helpers: {
					hasPro: () => false,
				},
			};
			extendedWindow.elementorPro = undefined;

			// Act
			renderWithStore( <Components />, store );

			// Assert
			expect( screen.getByText( /Try Components for free:/i ) ).toBeInTheDocument();
			expect(
				screen.getByText(
					/Soon Components will be part of the Pro subscription, but what you create now will remain on your site\./i
				)
			).toBeInTheDocument();
		} );

		it( 'should not render notification when no components exist', () => {
			// Arrange
			extendedWindow.elementor = {
				helpers: {
					hasPro: () => false,
				},
			};
			extendedWindow.elementorPro = undefined;
			act( () => {
				dispatch( slice.actions.load( [] ) );
			} );

			// Act
			renderWithStore( <Components />, store );

			// Assert
			expect( screen.queryByText( /Try Components for free:/i ) ).not.toBeInTheDocument();
		} );
	} );
} );

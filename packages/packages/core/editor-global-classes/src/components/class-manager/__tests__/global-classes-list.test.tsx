import * as React from 'react';
import { createMockDocument, createMockStyleDefinition, renderWithStore } from 'test-utils';
import { getCurrentDocument } from '@elementor/editor-documents';
import { type StyleDefinition } from '@elementor/editor-styles';
import { validateStyleLabel } from '@elementor/editor-styles-repository';
import {
	__createStore as createStore,
	__dispatch as dispatch,
	__registerSlice as registerSlice,
} from '@elementor/store';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';

import { mockTrackingModule } from '../../../__tests__/mocks';
import { useFilters } from '../../../hooks/use-filters';
import { slice } from '../../../store';
import { type SearchAndFilterContextType, useSearchAndFilters } from '../../search-and-filter/context';
import { GlobalClassesList } from '../global-classes-list';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	blockCommand: jest.fn(),
} ) );
jest.mock( '@elementor/editor-documents' );
jest.mock( '../../../hooks/use-filters' );
jest.mock( '../../search-and-filter/context' );
jest.mock( '@elementor/editor-styles-repository' );
jest.mock( '../../../hooks/use-css-class-usage', () => ( {
	useCssClassUsage: jest.fn().mockReturnValue( {
		data: {}, // or whatever shape your hook expects
		isLoading: false,
	} ),
	useCssClassUsageByID: jest.fn().mockReturnValue( {
		isLoading: false,
		data: {
			total: 1,
			content: [ { title: 'Test Page', elements: [ 'el1' ], pageId: '123', total: 1, type: 'Page' } ],
		},
	} ),
} ) );

jest.mock( '../../../utils/tracking', () => mockTrackingModule );

const mockUseSearchAndFiltersProps: SearchAndFilterContextType = {
	search: {
		inputValue: '',
		debouncedValue: '',
		handleChange: jest.fn(),
		onClearSearch: jest.fn(),
	},
	filters: {
		filters: { empty: false, onThisPage: false, unused: false },
		setFilters: jest.fn(),
		onClearFilter: jest.fn(),
	},
};

describe( 'GlobalClassesList', () => {
	let store: ReturnType< typeof createStore >;

	beforeEach( () => {
		jest.mocked( getCurrentDocument ).mockReturnValue( createMockDocument( { id: 1 } ) );

		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: true, errorMessage: null } );

		registerSlice( slice );

		store = createStore();
		jest.mocked( useSearchAndFilters ).mockReturnValue( { ...mockUseSearchAndFiltersProps } );
	} );

	it( 'should render the list of classes with its order', async () => {
		// Arrange.
		mockClasses( [
			{ id: 'class-1', label: 'Class 1' },
			{ id: 'class-2', label: 'Class 2' },
		] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		// Assert.
		const [ firstClass, secondClass ] = await screen.findAllByRole( 'listitem' );

		expect( within( firstClass ).getByText( 'Class 1' ) ).toBeInTheDocument();
		expect( within( secondClass ).getByText( 'Class 2' ) ).toBeInTheDocument();
	} );

	it( 'should allow renaming a class on click', async () => {
		// Arrange.
		mockClasses( [ { id: 'class-1', label: 'Class 1' } ] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.doubleClick( screen.getByRole( 'button', { name: 'Class 1' } ) );

		const editableField = screen.getByRole( 'textbox' );

		// Assert.
		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'New-Class-Name' } } );

		fireEvent.blur( editableField );

		// Assert.
		expect( editableField ).not.toBeInTheDocument();

		expect( screen.getByText( 'New-Class-Name' ) ).toBeInTheDocument();
	} );

	it( 'should not allow rename if the name is invalid', () => {
		// Arrange.
		mockClasses( [
			{ id: 'class-1', label: 'Class-1' },
			{ id: 'class-2', label: 'Class-2' },
		] );

		jest.mocked( validateStyleLabel ).mockReturnValue( { isValid: false, errorMessage: 'Test Error' } );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.doubleClick( screen.getByRole( 'button', { name: 'Class-1' } ) );

		const editableField = screen.getByRole( 'textbox' );

		// Assert.
		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'new-name' } } );

		fireEvent.keyDown( editableField, { key: 'Enter' } );

		// Assert.
		expect( editableField ).toBeInTheDocument();

		expect( screen.queryByText( 'new-name' ) ).not.toBeInTheDocument();
	} );

	it( 'should allow renaming a class from actions menu', async () => {
		// Arrange.
		mockClasses( [ { id: 'class-1', label: 'Class 1' } ] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );

		const renameButton = screen.getByRole( 'menuitem', { name: 'Rename' } );

		// Assert.
		expect( renameButton ).toBeInTheDocument();

		// Act.
		fireEvent.click( renameButton );

		const editableField = screen.getByRole( 'textbox' );

		// Assert.
		// Menu should be closed after clicking rename.
		await waitFor( () => {
			expect( renameButton ).not.toBeInTheDocument();
		} );

		expect( editableField ).toBeInTheDocument();

		// Act.
		fireEvent.input( editableField, { target: { innerText: 'New-Class-Name' } } );

		fireEvent.blur( editableField );

		// Assert.
		expect( editableField ).not.toBeInTheDocument();

		expect( screen.getByText( 'New-Class-Name' ) ).toBeInTheDocument();
	} );

	it( 'should show empty state when there are no classes', () => {
		// Arrange.
		mockClasses( [] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		// Assert.
		expect( screen.getByText( 'There are no global classes yet.' ) ).toBeInTheDocument();
	} );

	it( 'should allow deleting a class from actions menu', async () => {
		// Arrange.
		mockClasses( [
			{ id: 'class-1', label: 'Class 1' },
			{ id: 'class-2', label: 'Class 2' },
		] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		const [ firstClass ] = screen.getAllByRole( 'listitem' );

		fireEvent.click( within( firstClass ).getByRole( 'button', { name: 'More actions' } ) );

		const deleteButton = screen.getByRole( 'menuitem', { name: 'Delete' } );

		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this class?' } ) ).toBeInTheDocument();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Delete' } ) );

		// Assert.
		await waitFor( () => {
			expect( screen.queryByText( 'Class 1' ) ).not.toBeInTheDocument();
		} );
		expect( screen.getByText( 'Class 2' ) ).toBeInTheDocument();
	} );

	it( 'should close the delete dialog when clicking cancel, without deleting', async () => {
		// Arrange.
		mockClasses( [ { id: 'class-1', label: 'Class 1' } ] );

		// Act.
		renderWithStore( <GlobalClassesList />, store );

		fireEvent.click( screen.getByRole( 'button', { name: 'More actions' } ) );

		const deleteButton = screen.getByRole( 'menuitem', { name: 'Delete' } );

		fireEvent.click( deleteButton );

		// Assert.
		await waitFor( () => {
			expect( screen.getByRole( 'dialog', { name: 'Delete this class?' } ) ).toBeInTheDocument();
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Not now' } ) );

		// Assert.
		expect( screen.queryByRole( 'dialog', { name: 'Delete this class?' } ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Class 1' ) ).toBeInTheDocument();
	} );

	it( 'should show 1 class based on search value', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'foo',
				debouncedValue: 'foo',
			} as SearchAndFilterContextType[ 'search' ],
		} );
		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.queryByText( 'Header' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Footer' ) ).toBeInTheDocument();
	} );

	it( 'should show 2 class based on search value', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'ER',
				debouncedValue: 'ER',
			} as SearchAndFilterContextType[ 'search' ],
		} );
		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( 'Header' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Footer' ) ).toBeInTheDocument();
	} );

	it( 'should show not found message if no match found with searchValue', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'notFound',
				debouncedValue: 'notFound',
			} as SearchAndFilterContextType[ 'search' ],
		} );
		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );
		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( /Sorry, nothing match/i ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /clear & try again/i } ) ).toBeInTheDocument();
	} );

	it( 'should call onClearSearch when "Clear & try again" is clicked', () => {
		const mockOnClearSearch = jest.fn();
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'notfound',
				debouncedValue: 'notfound',
				onClearSearch: mockOnClearSearch as () => void,
			} as SearchAndFilterContextType[ 'search' ],
		} );

		mockClasses( [ { id: 'class-1', label: 'Header' } ] );

		renderWithStore( <GlobalClassesList />, store );

		const clearBtn = screen.getByRole( 'button', { name: /clear & try again/i } );

		fireEvent.click( clearBtn );

		expect( mockOnClearSearch ).toHaveBeenCalled();
	} );

	it( 'should show full list when searchValue is too short', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'H',
				debouncedValue: 'H',
			} as SearchAndFilterContextType[ 'search' ],
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( 'Header' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Footer' ) ).toBeInTheDocument();
	} );

	// Add these tests to the existing GlobalClassesList test suite

	it( 'should show only unused classes when unused filter is active', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'class-2' ] );
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: true,
					empty: false,
					onThisPage: false,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.queryByText( 'Header' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'Footer' ) ).toBeInTheDocument();
	} );

	it( 'should show only empty classes when empty filter is active', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'empty' ] );

		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: false,
					empty: true,
					onThisPage: false,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
			{ id: 'empty', label: 'emptyClass' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.queryByText( 'Header' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Footer' ) ).not.toBeInTheDocument();
		expect( screen.getByText( 'emptyClass' ) ).toBeInTheDocument();
	} );

	it( 'should show only classes used on this page when onThisPage filter is active', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'class-1' ] );

		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: false,
					empty: false,
					onThisPage: true,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( 'Header' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Footer' ) ).not.toBeInTheDocument();
	} );

	it( 'should combine search and filters correctly', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'class-1', 'class-2', 'class-3' ] );

		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'head',
				debouncedValue: 'head',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			},
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: true,
					empty: false,
					onThisPage: false,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Header-unused' },
			{ id: 'class-3', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( 'Header' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Header-unused' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Footer' ) ).not.toBeInTheDocument();
	} );

	it( 'should show not found message when no results match filters', () => {
		jest.mocked( useFilters ).mockReturnValue( [] );

		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: true,
					empty: true,
					onThisPage: true,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( /Sorry, nothing match/i ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /clear & try again/i } ) ).toBeInTheDocument();
	} );

	it( 'should show not found message when no results match combined search and filters', () => {
		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			search: {
				inputValue: 'nonexistent',
				debouncedValue: 'nonexistent',
				handleChange: jest.fn(),
				onClearSearch: jest.fn(),
			},
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: true,
					empty: false,
					onThisPage: false,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( /Sorry, nothing match/i ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /clear & try again/i } ) ).toBeInTheDocument();
	} );

	it( 'should show all classes when no filters are active', () => {
		jest.mocked( useFilters ).mockReturnValue( null );

		jest.mocked( useSearchAndFilters ).mockReturnValue( {
			...mockUseSearchAndFiltersProps,
			filters: {
				...mockUseSearchAndFiltersProps.filters,
				filters: {
					unused: false,
					empty: false,
					onThisPage: false,
				},
			},
		} );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		expect( screen.getByText( 'Header' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Footer' ) ).toBeInTheDocument();
	} );

	it( 'should show sort indicator on hover when there are more than 1 class', () => {
		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		const triggers = screen.getAllByRole( 'button', { name: 'sort' } );

		expect( triggers ).toHaveLength( 2 );
	} );

	it( 'should not show sort indicator when there is only 1 class', () => {
		mockClasses( [ { id: 'class-1', label: 'Header' } ] );

		renderWithStore( <GlobalClassesList />, store );

		const triggers = screen.queryAllByRole( 'button', { name: 'sort' } );

		expect( triggers ).toHaveLength( 0 );
	} );

	it( 'should not show sort indicator when filters are applied', () => {
		jest.mocked( useFilters ).mockReturnValue( [ 'class-' ] );

		mockClasses( [
			{ id: 'class-1', label: 'Header' },
			{ id: 'class-2', label: 'Footer' },
			{ id: 'class-3', label: 'Footer' },
		] );

		renderWithStore( <GlobalClassesList />, store );

		const triggers = screen.queryAllByRole( 'button', { name: 'sort' } );

		expect( triggers ).toHaveLength( 0 );
	} );
} );

const mockClasses = ( classes: Pick< StyleDefinition, 'id' | 'label' >[] ) => {
	const data = {
		items: Object.fromEntries(
			classes.map( ( { id, label } ) => [ id, createMockStyleDefinition( { id, label } ) ] )
		),
		order: classes.map( ( { id } ) => id ),
	};

	act( () =>
		dispatch(
			slice.actions.load( {
				preview: data,
				frontend: data,
			} )
		)
	);
};

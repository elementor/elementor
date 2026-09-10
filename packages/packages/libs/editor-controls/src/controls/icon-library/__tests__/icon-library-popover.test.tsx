import * as React from 'react';
import { ThemeProvider } from '@elementor/ui';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import {
	ICON_LIBRARY_ROW_HEIGHT,
	ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY,
	IconLibraryPopover,
} from '../icon-library-popover';
import { useFontAwesome7Catalog } from '../use-font-awesome-7-catalog';

jest.mock( '../use-font-awesome-7-catalog' );

jest.mock( '@tanstack/react-virtual', () => ( {
	useVirtualizer: jest.fn().mockImplementation( ( config ) => {
		const indices = Array.from( { length: config.count }, ( _, i ) => i );

		return {
			getVirtualItems: jest.fn().mockReturnValue(
				indices.map( ( index ) => ( {
					key: `item-${ index }`,
					index,
					start: index * ICON_LIBRARY_ROW_HEIGHT,
					size: ICON_LIBRARY_ROW_HEIGHT,
				} ) )
			),
			getTotalSize: jest.fn().mockReturnValue( config.count * ICON_LIBRARY_ROW_HEIGHT ),
			scrollToIndex: jest.fn(),
			getVirtualIndexes: jest.fn().mockReturnValue( indices ),
		};
	} ),
} ) );

describe( 'IconLibraryPopover', () => {
	const icons = [
		{
			id: 'fa-solid:star',
			name: 'star',
			label: 'star',
			library: 'fa-solid',
			value: 'fa-solid fa-star',
			aliases: [ 'favorite' ],
			width: 576,
			height: 512,
			paths: [ 'M0 0h100v100H0z' ],
		},
		{
			id: 'fa-regular:circle',
			name: 'circle',
			label: 'circle',
			library: 'fa-regular',
			value: 'fa-regular fa-circle',
			aliases: [],
			width: 512,
			height: 512,
			paths: [ 'M1 1h10v10H1z' ],
		},
		{
			id: 'fa-brands:github',
			name: 'github',
			label: 'github',
			library: 'fa-brands',
			value: 'fa-brands fa-github',
			aliases: [],
			width: 496,
			height: 512,
			paths: [ 'M2 2h10v10H2z' ],
		},
	];

	beforeEach( () => {
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( {
			data: icons,
			isLoading: false,
		} as never );
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'selects an icon and closes', () => {
		// Arrange.
		const onSelect = jest.fn();
		const onClose = jest.fn();

		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass={ null }
					selectedIconLibrary={ null }
					onSelect={ onSelect }
					onClose={ onClose }
				/>
			</ThemeProvider>
		);

		// Act.
		fireEvent.click( screen.getByRole( 'option', { name: /star/i } ) );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( { value: 'fa-solid fa-star', library: 'fa-solid' } );
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'highlights the selected icon when the stored class uses an alias', () => {
		// Arrange.
		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass="fa-solid fa-favorite"
					selectedIconLibrary="fa-solid"
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
				/>
			</ThemeProvider>
		);

		// Assert.
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toHaveAttribute( 'aria-selected', 'true' );
	} );

	it( 'filters by library without clearing the search query', () => {
		// Arrange.
		jest.useFakeTimers();

		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass={ null }
					selectedIconLibrary={ null }
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
				/>
			</ThemeProvider>
		);

		const search = screen.getByPlaceholderText( 'Search' );

		// Act.
		fireEvent.change( search, { target: { value: 'star' } } );
		act( () => {
			jest.advanceTimersByTime( ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY );
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Filter by library' } ) );
		expect( screen.getByRole( 'menuitemcheckbox', { name: 'All icons' } ) ).toBeChecked();
		fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Regular' } ) );

		// Assert.
		expect( search ).toHaveValue( 'star' );
		expect( screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Regular' } ) ).toBeChecked();
		expect( screen.getByText( /Sorry, nothing matched/ ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Solid' } ) );
		fireEvent.keyDown( screen.getByRole( 'menu' ), { key: 'Escape' } );

		// Assert.
		expect( search ).toHaveValue( 'star' );
		expect( screen.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'option', { name: /github/i } ) ).not.toBeInTheDocument();
	} );

	it( 'supports keyboard navigation and restores focus when the filter menu closes', async () => {
		// Arrange.
		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass={ null }
					selectedIconLibrary={ null }
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
				/>
			</ThemeProvider>
		);

		const filterButton = screen.getByRole( 'button', { name: 'Filter by library' } );

		// Act.
		act( () => filterButton.focus() );
		fireEvent.click( filterButton );

		const menu = screen.getByRole( 'menu', { name: 'Filter by library' } );
		const allIconsOption = screen.getByRole( 'menuitemcheckbox', { name: 'All icons' } );

		// Assert.
		expect( filterButton ).toHaveAttribute( 'aria-expanded', 'true' );
		expect( allIconsOption ).toBeChecked();
		await waitFor( () => expect( allIconsOption ).toHaveFocus() );

		// Act.
		fireEvent.keyDown( menu, { key: 'ArrowDown' } );

		const regularOption = screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Regular' } );

		expect( regularOption ).toHaveFocus();

		fireEvent.keyDown( regularOption, { key: 'Enter' } );

		// Assert.
		expect( regularOption ).toBeChecked();

		// Act.
		fireEvent.keyDown( menu, { key: 'Escape' } );

		// Assert.
		expect( filterButton ).toHaveFocus();
		expect( filterButton ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	it( 'filters by search and shows an empty state', () => {
		// Arrange.
		jest.useFakeTimers();

		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass={ null }
					selectedIconLibrary={ null }
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
				/>
			</ThemeProvider>
		);

		// Act.
		fireEvent.change( screen.getByPlaceholderText( 'Search' ), { target: { value: 'missing' } } );

		// Assert.
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toBeInTheDocument();

		act( () => {
			jest.advanceTimersByTime( ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY );
		} );

		expect( screen.getByText( /Sorry, nothing matched/ ) ).toBeInTheDocument();
		expect( screen.getByText( /missing/ ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Clear & try again' } ) );

		expect( screen.getByPlaceholderText( 'Search' ) ).toHaveValue( '' );
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toBeInTheDocument();
	} );

	it( 'shows a load failure when the catalog is empty', () => {
		// Arrange.
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( {
			data: [],
			isLoading: false,
		} as never );

		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass={ null }
					selectedIconLibrary={ null }
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
				/>
			</ThemeProvider>
		);

		// Assert.
		expect( screen.getByText( /Icons couldn't be loaded/ ) ).toBeInTheDocument();
	} );

	it( 'resets the library filter when closed', () => {
		// Arrange.
		const onClose = jest.fn();

		render(
			<ThemeProvider>
				<IconLibraryPopover
					open
					selectedIconClass={ null }
					selectedIconLibrary={ null }
					onSelect={ jest.fn() }
					onClose={ onClose }
				/>
			</ThemeProvider>
		);

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Filter by library' } ) );
		fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Brands' } ) );
		fireEvent.keyDown( screen.getByRole( 'menu' ), { key: 'Escape' } );
		fireEvent.click( screen.getByRole( 'button', { name: 'close' } ) );

		// Assert.
		expect( onClose ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByRole( 'button', { name: 'Filter by library' } ) ).toBeInTheDocument();

		fireEvent.click( screen.getByRole( 'button', { name: 'Filter by library' } ) );
		expect( screen.getByRole( 'menuitemcheckbox', { name: 'All icons' } ) ).toBeChecked();
	} );
} );

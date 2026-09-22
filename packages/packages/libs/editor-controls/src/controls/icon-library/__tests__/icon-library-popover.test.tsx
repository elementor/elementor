import * as React from 'react';
import { ThemeProvider } from '@elementor/ui';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY } from '../icon-library-grid';
import { ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY, IconLibraryPopover } from '../icon-library-popover';
import { useCustomIconLibraries } from '../use-custom-icon-libraries';
import { useFontAwesome7Catalog } from '../use-font-awesome-7-catalog';

jest.mock( '../use-font-awesome-7-catalog' );
jest.mock( '../use-custom-icon-libraries' );

const scrollToIndex = jest.fn();
let mockVisibleIndices: number[] | null = null;

jest.mock( '@tanstack/react-virtual', () => ( {
	useVirtualizer: jest.fn().mockImplementation( ( config ) => {
		const rowHeight = config.estimateSize();
		const indices = mockVisibleIndices ?? Array.from( { length: config.count }, ( _, index ) => index );

		return {
			getVirtualItems: jest.fn().mockReturnValue(
				indices.map( ( index ) => ( {
					key: `item-${ index }`,
					index,
					start: index * rowHeight,
					size: rowHeight,
				} ) )
			),
			getTotalSize: jest.fn().mockReturnValue( config.count * rowHeight ),
			scrollToIndex,
			measure: jest.fn(),
			getVirtualIndexes: jest.fn().mockReturnValue( indices ),
		};
	} ),
} ) );

const createIcon = ( name: string, library: 'fa-solid' | 'fa-regular' | 'fa-brands', aliases: string[] = [] ) => ( {
	id: `${ library }:${ name }`,
	name,
	label: name,
	library,
	value: `${ library } fa-${ name }`,
	aliases,
	width: 512,
	height: 512,
	paths: [ 'M0 0h10v10H0z' ],
} );

const renderPopover = ( props: Partial< React.ComponentProps< typeof IconLibraryPopover > > = {} ) =>
	render(
		<ThemeProvider>
			<IconLibraryPopover
				open
				selectedIconClass={ null }
				selectedIconLibrary={ null }
				onSelect={ jest.fn() }
				onClose={ jest.fn() }
				{ ...props }
			/>
		</ThemeProvider>
	);

const switchToGridView = () => {
	fireEvent.click( screen.getByRole( 'button', { name: 'List view' } ) );
	fireEvent.click( screen.getByRole( 'menuitemradio', { name: 'Grid' } ) );
};

const switchToListView = () => {
	fireEvent.click( screen.getByRole( 'button', { name: 'Grid view' } ) );
	fireEvent.click( screen.getByRole( 'menuitemradio', { name: 'List' } ) );
};

const restoreClientWidth = () => {
	Object.defineProperty( HTMLElement.prototype, 'clientWidth', {
		configurable: true,
		get: () => 0,
	} );
};

describe( 'IconLibraryPopover', () => {
	const icons = [
		createIcon( 'star', 'fa-solid', [ 'favorite' ] ),
		createIcon( 'circle', 'fa-regular' ),
		createIcon( 'github', 'fa-brands' ),
		createIcon( 'heart', 'fa-solid' ),
		createIcon( 'bell', 'fa-regular' ),
		createIcon( 'wordpress', 'fa-brands' ),
	];

	beforeEach( () => {
		sessionStorage.clear();
		mockVisibleIndices = null;
		scrollToIndex.mockClear();
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( {
			data: icons,
			isLoading: false,
		} as never );
		jest.mocked( useCustomIconLibraries ).mockReturnValue( {
			data: [],
			isLoading: false,
		} as never );

		if ( ! globalThis.ResizeObserver ) {
			globalThis.ResizeObserver = class {
				observe() {}
				unobserve() {}
				disconnect() {}
			} as unknown as typeof ResizeObserver;
		}

		restoreClientWidth();
	} );

	afterEach( () => {
		jest.useRealTimers();
		document.documentElement.removeAttribute( 'dir' );
		restoreClientWidth();
		delete ( window as { elementor?: typeof window.elementor } ).elementor;
	} );

	it( 'opens in list view by default', () => {
		// Arrange.
		renderPopover();

		// Assert.
		expect( screen.getByRole( 'listbox' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'grid' ) ).not.toBeInTheDocument();
	} );

	it( 'persists the selected view after the picker is closed and reopened', () => {
		// Arrange.
		const onClose = jest.fn();
		const { unmount } = renderPopover( { onClose } );

		// Act.
		switchToGridView();
		fireEvent.click( screen.getByRole( 'button', { name: 'close' } ) );
		unmount();
		renderPopover();

		// Assert.
		expect( onClose ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByRole( 'grid' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Grid view' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'listbox' ) ).not.toBeInTheDocument();
	} );

	it( 'fits as many equal columns as the popover width allows', () => {
		// Arrange.
		Object.defineProperty( HTMLElement.prototype, 'clientWidth', {
			configurable: true,
			get: () => 500,
		} );

		renderPopover();
		switchToGridView();

		// Assert.
		expect( screen.getByRole( 'grid', { name: 'Icons' } ) ).toHaveAttribute( 'aria-colcount', '8' );
	} );

	it( 'keeps measuring the grid after an empty search is cleared', () => {
		// Arrange.
		jest.useFakeTimers();
		renderPopover();
		switchToGridView();

		// Act.
		fireEvent.change( screen.getByPlaceholderText( 'Search' ), { target: { value: 'missing' } } );
		act( () => {
			jest.advanceTimersByTime( ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY );
		} );

		// Assert.
		expect( screen.getByText( /Sorry, nothing matched/ ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Clear & try again' } ) );

		// Assert.
		expect( screen.getByRole( 'grid', { name: 'Icons' } ) ).toBeInTheDocument();
	} );

	it( 'reverses horizontal grid keys in RTL', () => {
		// Arrange.
		document.documentElement.setAttribute( 'dir', 'rtl' );
		renderPopover();
		switchToGridView();

		const star = screen.getByRole( 'gridcell', { name: /star/i } );

		// Act.
		act( () => star.focus() );
		fireEvent.keyDown( star, { key: 'ArrowRight' } );

		// Assert.
		expect( star ).toHaveFocus();

		// Act.
		fireEvent.keyDown( star, { key: 'ArrowLeft' } );

		// Assert.
		expect( screen.getByRole( 'gridcell', { name: /circle/i } ) ).toHaveFocus();
	} );

	it( 'preserves search, filter, and selection when switching views', () => {
		// Arrange.
		jest.useFakeTimers();
		renderPopover( {
			selectedIconClass: 'fa-solid fa-star',
			selectedIconLibrary: 'fa-solid',
		} );

		const search = screen.getByPlaceholderText( 'Search' );

		// Act.
		fireEvent.change( search, { target: { value: 'star' } } );
		act( () => {
			jest.advanceTimersByTime( ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY );
		} );
		fireEvent.click( screen.getByRole( 'button', { name: 'Filter by library' } ) );
		fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Solid' } ) );
		fireEvent.keyDown( screen.getByRole( 'menu' ), { key: 'Escape' } );
		switchToGridView();

		// Assert.
		expect( search ).toHaveValue( 'star' );
		expect( screen.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'gridcell', { name: /star/i } ) ).toHaveAttribute( 'aria-selected', 'true' );
		expect( screen.queryByRole( 'gridcell', { name: /github/i } ) ).not.toBeInTheDocument();

		// Act.
		switchToListView();

		// Assert.
		expect( search ).toHaveValue( 'star' );
		expect( screen.getByRole( 'button', { name: 'Filter by library, active' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toHaveAttribute( 'aria-selected', 'true' );
		expect( screen.queryByRole( 'option', { name: /github/i } ) ).not.toBeInTheDocument();
	} );

	it( 'selects an icon and closes', () => {
		// Arrange.
		const onSelect = jest.fn();
		const onClose = jest.fn();

		renderPopover( { onSelect, onClose } );

		// Act.
		fireEvent.click( screen.getByRole( 'option', { name: /star/i } ) );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( { value: 'fa-solid fa-star', library: 'fa-solid' } );
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'selects a grid icon and closes', () => {
		// Arrange.
		const onSelect = jest.fn();
		const onClose = jest.fn();

		renderPopover( { onSelect, onClose } );
		switchToGridView();

		// Act.
		fireEvent.click( screen.getByRole( 'gridcell', { name: /star/i } ) );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( { value: 'fa-solid fa-star', library: 'fa-solid' } );
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'selects a grid icon with Enter and Space', () => {
		// Arrange.
		const onSelect = jest.fn();
		const onClose = jest.fn();

		const { unmount } = renderPopover( { onSelect, onClose } );
		switchToGridView();

		// Act.
		fireEvent.keyDown( screen.getByRole( 'gridcell', { name: /star/i } ), { key: 'Enter' } );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( { value: 'fa-solid fa-star', library: 'fa-solid' } );
		expect( onClose ).toHaveBeenCalledTimes( 1 );

		// Arrange.
		unmount();
		onSelect.mockClear();
		onClose.mockClear();
		renderPopover( { onSelect, onClose } );

		// Act.
		fireEvent.keyDown( screen.getByRole( 'gridcell', { name: /star/i } ), { key: ' ' } );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( { value: 'fa-solid fa-star', library: 'fa-solid' } );
		expect( onClose ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'falls back to the default view when session storage is invalid', () => {
		// Arrange.
		sessionStorage.setItem( 'editor-controls/icon-library-view', JSON.stringify( { item: 'cards' } ) );

		renderPopover();

		// Assert.
		expect( screen.getByRole( 'listbox' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'List view' } ) );

		// Assert.
		expect( screen.getByRole( 'menuitemradio', { name: 'List' } ) ).toBeChecked();
	} );

	it( 'highlights the selected icon when the stored class uses an alias', () => {
		// Arrange.
		renderPopover( {
			selectedIconClass: 'fa-solid fa-favorite',
			selectedIconLibrary: 'fa-solid',
		} );

		// Assert.
		expect( screen.getByRole( 'option', { name: /star/i } ) ).toHaveAttribute( 'aria-selected', 'true' );
	} );

	it( 'filters by library without clearing the search query', () => {
		// Arrange.
		jest.useFakeTimers();
		renderPopover();

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
		renderPopover();

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

	it( 'closes the filter menu when its trigger is clicked again', async () => {
		// Arrange.
		renderPopover();

		const filterButton = screen.getByRole( 'button', { name: 'Filter by library' } );

		// Act.
		fireEvent.click( filterButton );
		fireEvent.click( filterButton );

		// Assert.
		await waitFor( () => {
			expect( screen.queryByRole( 'menu', { name: 'Filter by library' } ) ).not.toBeInTheDocument();
		} );
		expect( filterButton ).toHaveAttribute( 'aria-expanded', 'false' );
	} );

	it( 'filters by search and shows an empty state', () => {
		// Arrange.
		jest.useFakeTimers();
		renderPopover();

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

		renderPopover();

		// Assert.
		expect( screen.getByText( /Icons couldn't be loaded/ ) ).toBeInTheDocument();
	} );

	it( 'resets the library filter when closed', () => {
		// Arrange.
		const onClose = jest.fn();

		renderPopover( { onClose } );

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

	it( 'moves grid focus with two-dimensional keys including incomplete last rows', () => {
		// Arrange.
		renderPopover();
		switchToGridView();

		const star = screen.getByRole( 'gridcell', { name: /star/i } );

		// Act.
		act( () => star.focus() );
		fireEvent.keyDown( star, { key: 'ArrowRight' } );

		// Assert.
		expect( screen.getByRole( 'gridcell', { name: /circle/i } ) ).toHaveFocus();

		// Act.
		const circle = screen.getByRole( 'gridcell', { name: /circle/i } );
		fireEvent.keyDown( circle, { key: 'Home' } );

		// Assert.
		expect( star ).toHaveFocus();

		// Act.
		fireEvent.keyDown( star, { key: 'End' } );

		// Assert.
		expect( screen.getByRole( 'gridcell', { name: /heart/i } ) ).toHaveFocus();

		// Act.
		const heart = screen.getByRole( 'gridcell', { name: /heart/i } );
		fireEvent.keyDown( heart, { key: 'ArrowDown' } );

		// Assert.
		expect( heart ).toHaveFocus();

		// Act.
		act( () => circle.focus() );
		fireEvent.keyDown( circle, { key: 'ArrowDown' } );

		// Assert.
		expect( screen.getByRole( 'gridcell', { name: /wordpress/i } ) ).toHaveFocus();

		// Act.
		const wordpress = screen.getByRole( 'gridcell', { name: /wordpress/i } );
		fireEvent.keyDown( wordpress, { key: 'ArrowDown' } );

		// Assert.
		expect( wordpress ).toHaveFocus();

		// Act.
		fireEvent.keyDown( wordpress, { key: 'Home' } );

		// Assert.
		expect( screen.getByRole( 'gridcell', { name: /bell/i } ) ).toHaveFocus();

		// Act.
		fireEvent.keyDown( screen.getByRole( 'gridcell', { name: /bell/i } ), { key: 'Control', ctrlKey: true } );
		fireEvent.keyDown( screen.getByRole( 'gridcell', { name: /bell/i } ), { key: 'Home', ctrlKey: true } );

		// Assert.
		expect( star ).toHaveFocus();

		// Act.
		fireEvent.keyDown( star, { key: 'End', ctrlKey: true } );

		// Assert.
		expect( wordpress ).toHaveFocus();
	} );

	it( 'moves the roving tab index to the pointer-focused cell', () => {
		// Arrange.
		renderPopover();
		switchToGridView();

		const star = screen.getByRole( 'gridcell', { name: /star/i } );
		const heart = screen.getByRole( 'gridcell', { name: /heart/i } );

		// Assert.
		expect( star ).toHaveAttribute( 'tabIndex', '0' );

		// Act.
		act( () => heart.focus() );

		// Assert.
		expect( heart ).toHaveAttribute( 'tabIndex', '0' );
		expect( star ).toHaveAttribute( 'tabIndex', '-1' );
	} );

	it( 'clamps grid focus when the filtered list shrinks', () => {
		// Arrange.
		renderPopover();
		switchToGridView();

		const heart = screen.getByRole( 'gridcell', { name: /heart/i } );

		// Act.
		act( () => heart.focus() );
		fireEvent.click( screen.getByRole( 'button', { name: 'Filter by library' } ) );
		fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'Font Awesome - Brands' } ) );
		fireEvent.keyDown( screen.getByRole( 'menu' ), { key: 'Escape' } );

		// Assert.
		expect( screen.getByRole( 'gridcell', { name: /wordpress/i } ) ).toHaveAttribute( 'tabIndex', '0' );
		expect( screen.getByRole( 'gridcell', { name: /github/i } ) ).toHaveAttribute( 'tabIndex', '-1' );
	} );

	it( 'restores focus after an off-screen grid row mounts', () => {
		// Arrange.
		mockVisibleIndices = [ 0 ];
		const { rerender } = renderPopover();
		switchToGridView();
		const star = screen.getByRole( 'gridcell', { name: /star/i } );

		expect( screen.queryByRole( 'gridcell', { name: /bell/i } ) ).not.toBeInTheDocument();

		// Act.
		act( () => star.focus() );
		fireEvent.keyDown( star, { key: 'ArrowDown' } );

		// Assert.
		expect( scrollToIndex ).toHaveBeenCalledWith( 1 );
		expect( screen.queryByRole( 'gridcell', { name: /bell/i } ) ).not.toBeInTheDocument();

		// Act.
		mockVisibleIndices = [ 1 ];
		rerender(
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
		expect( screen.getByRole( 'gridcell', { name: /bell/i } ) ).toHaveFocus();
	} );

	it( 'lists custom library icons and stores the library value on select', () => {
		// Arrange.
		const onSelect = jest.fn();
		const customIcon = {
			id: 'my-icons:badge',
			name: 'badge',
			label: 'badge',
			library: 'my-icons',
			value: 'my-icons my-icons-badge',
			aliases: [],
			width: 512,
			height: 512,
			paths: [],
			glyphClass: 'my-icons my-icons-badge',
		};

		window.elementor = {
			...window.elementor,
			config: {
				icons: {
					libraries: [
						{
							name: 'my-icons',
							label: 'My Icons',
							prefix: 'my-icons-',
							displayPrefix: 'my-icons',
							fetchJson: 'https://example.com/my-icons.js',
							native: false,
						},
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
		jest.mocked( useCustomIconLibraries ).mockReturnValue( {
			data: [ customIcon ],
			isLoading: false,
		} as never );

		renderPopover( { onSelect } );

		// Act.
		fireEvent.click( screen.getByRole( 'option', { name: /badge/i } ) );

		// Assert.
		expect( onSelect ).toHaveBeenCalledWith( {
			value: 'my-icons my-icons-badge',
			library: 'my-icons',
		} );
	} );

	it( 'filters custom libraries under My Libraries without resetting search', () => {
		// Arrange.
		jest.useFakeTimers();
		const customIcon = {
			id: 'my-icons:badge',
			name: 'badge',
			label: 'badge',
			library: 'my-icons',
			value: 'my-icons my-icons-badge',
			aliases: [],
			width: 512,
			height: 512,
			paths: [ 'M1 1' ],
		};

		window.elementor = {
			...window.elementor,
			config: {
				icons: {
					libraries: [
						{
							name: 'my-icons',
							label: 'My Icons',
							prefix: 'my-icons-',
							displayPrefix: 'my-icons',
							fetchJson: 'https://example.com/my-icons.js',
							native: false,
						},
					],
				},
			},
			helpers: {
				enqueueIconFonts: jest.fn(),
			},
		} as typeof window.elementor;
		jest.mocked( useCustomIconLibraries ).mockReturnValue( {
			data: [ customIcon ],
			isLoading: false,
		} as never );

		renderPopover();
		const search = screen.getByPlaceholderText( 'Search' );
		fireEvent.change( search, { target: { value: 'badge' } } );
		act( () => {
			jest.advanceTimersByTime( ICON_LIBRARY_SEARCH_DEBOUNCE_DELAY );
		} );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Filter by library' } ) );
		expect( screen.getByText( 'My Libraries' ) ).toBeInTheDocument();
		fireEvent.click( screen.getByRole( 'menuitemcheckbox', { name: 'My Icons' } ) );
		fireEvent.keyDown( screen.getByRole( 'menu' ), { key: 'Escape' } );

		// Assert.
		expect( search ).toHaveValue( 'badge' );
		expect( screen.getByRole( 'option', { name: /badge/i } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'option', { name: /star/i } ) ).not.toBeInTheDocument();
	} );

	it( 'shows a grid icon name tooltip only after one second', async () => {
		// Arrange.
		renderPopover();
		switchToGridView();
		jest.useFakeTimers();

		const star = screen.getByRole( 'gridcell', { name: /star/i } );
		const filterButton = screen.getByRole( 'button', { name: 'Filter by library' } );

		// Act.
		fireEvent.mouseOver( star );
		fireEvent.focus( star );
		act( () => {
			jest.advanceTimersByTime( ICON_LIBRARY_GRID_TOOLTIP_ENTER_DELAY - 1 );
		} );

		// Assert.
		expect( screen.queryByRole( 'tooltip', { name: 'star' } ) ).not.toBeInTheDocument();

		// Act.
		act( () => {
			jest.advanceTimersByTime( 1 );
		} );

		// Assert.
		expect( await screen.findByRole( 'tooltip', { name: 'star' } ) ).toBeInTheDocument();

		// Act.
		fireEvent.mouseOver( filterButton );
		fireEvent.focus( filterButton );

		// Assert.
		expect( await screen.findByRole( 'tooltip', { name: 'Filter by library' } ) ).toBeInTheDocument();
	} );
} );

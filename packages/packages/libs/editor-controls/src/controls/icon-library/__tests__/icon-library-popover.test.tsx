import * as React from 'react';
import { ThemeProvider } from '@elementor/ui';
import { fireEvent, render, screen } from '@testing-library/react';

import { ICON_LIBRARY_ROW_HEIGHT, IconLibraryPopover } from '../icon-library-popover';
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
	];

	beforeEach( () => {
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( {
			data: icons,
			isLoading: false,
		} as never );
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

	it( 'filters by search and shows an empty state', () => {
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

		// Act.
		fireEvent.change( screen.getByPlaceholderText( 'Search' ), { target: { value: 'missing' } } );

		// Assert.
		expect( screen.getByText( /Sorry, nothing matched/ ) ).toBeInTheDocument();
		expect( screen.getByText( /missing/ ) ).toBeInTheDocument();
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
} );

import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { PopoverMenuList } from '../menu-list';

const mockItems = [
	{ value: 'Item 1', type: 'item', disabled: false },
	{ value: 'Item 2', type: 'item', disabled: true },
	{ value: 'Item 3', type: 'item', disabled: false },
	{ value: 'Item 4', type: 'item', disabled: false },
	{ value: 'Item 5', type: 'item', disabled: true },
	{ value: 'Item 6', type: 'item', disabled: false },
	{ value: 'Item 7', type: 'item', disabled: false },
	{ value: 'Item 8', type: 'item', disabled: false },
];

let mockRangeExtractor: ( range: { startIndex: number; endIndex: number } ) => number[] = () => [];

jest.mock( '@tanstack/react-virtual', () => ( {
	useVirtualizer: jest.fn().mockImplementation( ( config ) => {
		mockRangeExtractor = config.rangeExtractor;

		return {
			getVirtualItems: jest
				.fn()
				.mockReturnValue(
					mockItems.map( ( item, index ) => ( { key: item.value, index, start: index * 10 } ) )
				),
			getTotalSize: jest.fn().mockReturnValue( mockItems.length ),
			scrollToIndex: jest.fn(),
			getVirtualIndexes: jest.fn().mockReturnValue( mockItems.map( ( _, index ) => index ) ),
		};
	} ),
} ) );

describe( 'PopoverMenuList', () => {
	it( 'should render an empty list', async () => {
		// Arrange.
		render(
			<PopoverMenuList
				items={ [] }
				onSelect={ jest.fn() }
				onClose={ jest.fn() }
				noResultsComponent={ <div>No results</div> }
			/>
		);

		// Assert.
		expect( screen.getByText( 'No results' ) ).toBeInTheDocument();
	} );

	it( 'should render a list with items', async () => {
		const onSelect = jest.fn();
		// Arrange.
		const enabledMockItems = mockItems.filter( ( item ) => ! item.disabled );
		render( <PopoverMenuList items={ mockItems } onSelect={ onSelect } onClose={ jest.fn() } /> );

		// Assert.
		enabledMockItems.forEach( ( item ) => {
			const itemElement = screen.getByText( item.value );
			expect( itemElement ).toBeInTheDocument();
			fireEvent.click( itemElement );
			expect( onSelect ).toHaveBeenCalledWith( item.value );
		} );

		expect( onSelect ).toHaveBeenCalledTimes( enabledMockItems.length );
	} );

	it( 'should render a list with items and a selected item', async () => {
		// Arrange.
		const selectedValue = 'Item 5';
		render(
			<PopoverMenuList
				items={ mockItems }
				onSelect={ jest.fn() }
				onClose={ jest.fn() }
				selectedValue={ selectedValue }
			/>
		);

		// Assert.
		mockItems.forEach( ( item ) => {
			const itemElement = screen.getByText( item.value );
			expect( itemElement ).toBeInTheDocument();
		} );

		const item5 = screen.getByText( selectedValue );
		expect( item5 ).toHaveAttribute( 'aria-selected', 'true' );
	} );

	it( 'should render a list with items and disabled items', async () => {
		// Arrange.
		const onSelect = jest.fn();
		render( <PopoverMenuList items={ mockItems } onSelect={ onSelect } onClose={ jest.fn() } /> );

		// Assert.
		mockItems.forEach( ( item ) => {
			const itemElement = screen.getByText( item.value );
			expect( itemElement ).toBeInTheDocument();
		} );

		let disabledItem = screen.getByText( mockItems[ 1 ].value );
		expect( disabledItem ).toHaveAttribute( 'aria-disabled', 'true' );
		fireEvent.click( disabledItem );
		expect( onSelect ).not.toHaveBeenCalled();
		disabledItem = screen.getByText( mockItems[ 4 ].value );
		expect( disabledItem ).toHaveAttribute( 'aria-disabled', 'true' );
		fireEvent.click( disabledItem );
		expect( onSelect ).not.toHaveBeenCalled();
		const item1 = screen.getByText( mockItems[ 0 ].value );
		expect( item1 ).toHaveAttribute( 'aria-disabled', 'false' );
		fireEvent.click( item1 );
		expect( onSelect ).toHaveBeenCalledWith( mockItems[ 0 ].value );
	} );
	describe( 'rovingFocus', () => {
		const getOption = ( value: string ) =>
			screen.getAllByRole( 'option' ).find( ( option ) => option.textContent === value ) as HTMLElement;

		it( 'should make only the first enabled item tabbable when nothing is selected', () => {
			// Arrange.
			render( <PopoverMenuList items={ mockItems } onSelect={ jest.fn() } onClose={ jest.fn() } rovingFocus /> );

			// Assert.
			const tabbable = screen.getAllByRole( 'option' ).filter( ( option ) => option.tabIndex === 0 );

			expect( tabbable ).toHaveLength( 1 );
			expect( tabbable[ 0 ] ).toBe( getOption( 'Item 1' ) );
		} );

		it( 'should make only the selected item tabbable', () => {
			// Arrange.
			render(
				<PopoverMenuList
					items={ mockItems }
					selectedValue="Item 4"
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
					rovingFocus
				/>
			);

			// Assert.
			const tabbable = screen.getAllByRole( 'option' ).filter( ( option ) => option.tabIndex === 0 );

			expect( tabbable ).toEqual( [ getOption( 'Item 4' ) ] );
		} );

		it( 'should move focus with the arrow keys and skip disabled items', () => {
			// Arrange.
			render( <PopoverMenuList items={ mockItems } onSelect={ jest.fn() } onClose={ jest.fn() } rovingFocus /> );

			getOption( 'Item 1' ).focus();

			// Act.
			fireEvent.keyDown( getOption( 'Item 1' ), { key: 'ArrowDown' } );

			// Assert.
			expect( getOption( 'Item 3' ) ).toHaveFocus();
			expect( getOption( 'Item 3' ).tabIndex ).toBe( 0 );
			expect( getOption( 'Item 1' ).tabIndex ).toBe( -1 );

			// Act.
			fireEvent.keyDown( getOption( 'Item 3' ), { key: 'ArrowUp' } );

			// Assert.
			expect( getOption( 'Item 1' ) ).toHaveFocus();
		} );

		it( 'should move focus to the first and last enabled items with Home and End', () => {
			// Arrange.
			render( <PopoverMenuList items={ mockItems } onSelect={ jest.fn() } onClose={ jest.fn() } rovingFocus /> );

			getOption( 'Item 1' ).focus();

			// Act.
			fireEvent.keyDown( getOption( 'Item 1' ), { key: 'End' } );

			// Assert.
			expect( getOption( 'Item 8' ) ).toHaveFocus();

			// Act.
			fireEvent.keyDown( getOption( 'Item 8' ), { key: 'Home' } );

			// Assert.
			expect( getOption( 'Item 1' ) ).toHaveFocus();
		} );

		it( 'should select and close with Enter on the focused item', () => {
			// Arrange.
			const onSelect = jest.fn();
			const onClose = jest.fn();

			render( <PopoverMenuList items={ mockItems } onSelect={ onSelect } onClose={ onClose } rovingFocus /> );

			getOption( 'Item 1' ).focus();
			fireEvent.keyDown( getOption( 'Item 1' ), { key: 'ArrowDown' } );

			// Act.
			fireEvent.keyDown( getOption( 'Item 3' ), { key: 'Enter' } );

			// Assert.
			expect( onSelect ).toHaveBeenCalledWith( 'Item 3' );
			expect( onClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should prevent the default Enter action so it does not click the element focused after closing', () => {
			// Arrange.
			render( <PopoverMenuList items={ mockItems } onSelect={ jest.fn() } onClose={ jest.fn() } rovingFocus /> );

			// Act.
			const notPrevented = fireEvent.keyDown( getOption( 'Item 1' ), { key: 'Enter' } );

			// Assert.
			expect( notPrevented ).toBe( false );
		} );

		it( 'should select and close with Space on the focused item', () => {
			// Arrange.
			const onSelect = jest.fn();
			const onClose = jest.fn();

			render( <PopoverMenuList items={ mockItems } onSelect={ onSelect } onClose={ onClose } rovingFocus /> );

			// Act.
			const notPrevented = fireEvent.keyDown( getOption( 'Item 1' ), { key: ' ' } );

			// Assert.
			expect( notPrevented ).toBe( false );
			expect( onSelect ).toHaveBeenCalledWith( 'Item 1' );
			expect( onClose ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should keep the tab stop mounted when it is outside the visible range', () => {
			// Arrange.
			render(
				<PopoverMenuList
					items={ mockItems }
					selectedValue="Item 8"
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
					rovingFocus
				/>
			);

			// Act.
			const indices = mockRangeExtractor( { startIndex: 0, endIndex: 2 } );

			// Assert.
			expect( indices ).toEqual( [ 0, 1, 2, 7 ] );
		} );

		it( 'should keep the previous tab behavior when rovingFocus is off', () => {
			// Arrange.
			render(
				<PopoverMenuList
					items={ mockItems }
					selectedValue="Item 4"
					onSelect={ jest.fn() }
					onClose={ jest.fn() }
				/>
			);

			// Act.
			fireEvent.keyDown( getOption( 'Item 4' ), { key: 'ArrowDown' } );

			// Assert.
			expect( getOption( 'Item 6' ) ).not.toHaveFocus();
			expect( getOption( 'Item 1' ).tabIndex ).toBe( -1 );
		} );
	} );
} );

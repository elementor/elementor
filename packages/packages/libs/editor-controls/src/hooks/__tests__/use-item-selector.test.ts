import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { type Category, ItemSelector } from '../../components/item-selector';

// Mock PopoverMenuList to trigger onChange
const mockOnChange = jest.fn();
jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	PopoverMenuList: ( props: { onChange: typeof mockOnChange } ) => {
		// Store the onChange function so we can call it in tests
		mockOnChange.mockImplementation( props.onChange );
		return React.createElement( 'ul', { role: 'listbox', 'data-testid': 'item-list' } );
	},
} ) );

const MockIcon = ( { fontSize }: { fontSize: string } ) => React.createElement( 'div', { 'data-fontsize': fontSize } );

describe( 'ItemSelector', () => {
	const defaultProps = {
		itemsList: [
			{
				label: 'System',
				items: [ 'Font1', 'Font2' ],
			},
			{
				label: 'Google',
				items: [ 'Font3', 'Font4' ],
			},
		] as Category[],
		selectedItem: null,
		onItemChange: jest.fn(),
		onClose: jest.fn(),
		sectionWidth: 300,
		title: 'Select Item',
		icon: MockIcon,
	};

	beforeEach( () => {
		mockOnChange.mockClear();
	} );

	it( 'should render the item-select component', () => {
		// Act.
		render( React.createElement( ItemSelector, defaultProps ) );

		// Assert.
		expect( screen.getByText( 'Select Item' ) ).toBeInTheDocument();
		expect( screen.getByPlaceholderText( 'Search' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'listbox' ) ).toBeInTheDocument();
	} );

	it( 'should call onDebounce when debouncing', async () => {
		// Arrange.
		jest.useFakeTimers();
		const onDebounce = jest.fn();
		const propsWithDebounce = {
			...defaultProps,
			onDebounce,
		};

		// Act.
		render( React.createElement( ItemSelector, propsWithDebounce ) );

		const mockGetVirtualIndexes = () => [ 1 ];
		mockOnChange( { getVirtualIndexes: mockGetVirtualIndexes } );

		jest.advanceTimersByTime( 100 );

		// Assert.
		expect( onDebounce ).toHaveBeenCalledWith( 'Font1' );

		// Cleanup
		jest.useRealTimers();
	} );
} );

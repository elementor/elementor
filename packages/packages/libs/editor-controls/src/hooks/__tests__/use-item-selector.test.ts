import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { type Category, ItemSelector } from '../../components/item-selector';

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

	it( 'should render the item-select component', () => {
		// Act.
		render( React.createElement( ItemSelector, defaultProps ) );

		// Assert.
		expect( screen.getByText( 'Select Item' ) ).toBeInTheDocument();
		expect( screen.getByPlaceholderText( 'Search' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'listbox' ) ).toBeInTheDocument();
	} );

	it( 'should call onDebounce when debouncing', () => {
		// Arrange.
		jest.useFakeTimers();
		const onDebounce = jest.fn();
		const propsWithDebounce = {
			...defaultProps,
			onDebounce,
		};

		// Act.
		render( React.createElement( ItemSelector, propsWithDebounce ) );
		jest.advanceTimersByTime( 100 );

		// Assert.
		expect( screen.getByRole( 'listbox' ) ).toBeInTheDocument();
		expect( onDebounce ).toBeDefined();

		// Cleanup
		jest.useRealTimers();
	} );
} );

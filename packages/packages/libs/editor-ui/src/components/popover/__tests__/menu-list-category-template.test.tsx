import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { PopoverMenuList, type VirtualizedItem } from '../menu-list';

const mockItems: VirtualizedItem< 'category' | 'item', string >[] = [
	{ type: 'category', value: 'Category 1', label: 'Category 1' },
	{ type: 'item', value: 'item-1', label: 'Item 1' },
	{ type: 'category', value: 'Category 2', label: 'Category 2' },
	{ type: 'item', value: 'item-2', label: 'Item 2' },
];

jest.mock( '@tanstack/react-virtual', () => ( {
	useVirtualizer: jest.fn().mockImplementation( () => ( {
		getVirtualItems: jest
			.fn()
			.mockReturnValue( mockItems.map( ( item, index ) => ( { key: item.value, index, start: index * 32 } ) ) ),
		getTotalSize: jest.fn().mockReturnValue( mockItems.length ),
		scrollToIndex: jest.fn(),
		getVirtualIndexes: jest.fn().mockReturnValue( mockItems.map( ( _, index ) => index ) ),
	} ) ),
} ) );

describe( 'PopoverMenuList - menuCategoryContentTemplate', () => {
	const onSelect = jest.fn();
	const onClose = jest.fn();

	it.each( [
		{
			scenario: 'default rendering',
			categoryTemplate: undefined,
			itemTemplate: undefined,
			expectCategories: [ 'Category 1', 'Category 2' ],
			expectItems: [ 'Item 1', 'Item 2' ],
		},
		{
			scenario: 'custom category template',
			categoryTemplate: ( item: VirtualizedItem< 'category' | 'item', string > ) => (
				<div data-testid={ `custom-${ item.value }` }>Custom: { item.label }</div>
			),
			itemTemplate: undefined,
			expectCategories: [ 'Custom: Category 1', 'Custom: Category 2' ],
			expectItems: [ 'Item 1', 'Item 2' ],
		},
		{
			scenario: 'both templates',
			categoryTemplate: ( item: VirtualizedItem< 'category' | 'item', string > ) => (
				<div>Category: { item.label }</div>
			),
			itemTemplate: ( item: VirtualizedItem< 'category' | 'item', string > ) => <div>Item: { item.label }</div>,
			expectCategories: [ 'Category: Category 1', 'Category: Category 2' ],
			expectItems: [ 'Item: Item 1', 'Item: Item 2' ],
		},
	] )(
		'should render correctly with $scenario',
		( { categoryTemplate, itemTemplate, expectCategories, expectItems } ) => {
			render(
				<PopoverMenuList
					items={ mockItems }
					onSelect={ onSelect }
					onClose={ onClose }
					categoryItemContentTemplate={ categoryTemplate }
					menuItemContentTemplate={ itemTemplate }
				/>
			);

			expectCategories.forEach( ( text ) => {
				expect( screen.getByText( text ) ).toBeInTheDocument();
			} );

			expectItems.forEach( ( text ) => {
				expect( screen.getByText( text ) ).toBeInTheDocument();
			} );
		}
	);
} );

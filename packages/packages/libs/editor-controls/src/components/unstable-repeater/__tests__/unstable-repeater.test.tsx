import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { AddItemAction } from '../actions/add-item-action';
import { Header } from '../header/header';
import { Label } from '../header/label';
import { Item } from '../items/item';
import { ItemsContainer } from '../items/items-container';
import { type ItemProps } from '../types';
import { UnstableRepeater } from '../unstable-repeater';

describe( 'UnstableRepeater', () => {
	const createItemSettings = < T extends { value?: unknown } >(
		overrides: Partial< ItemProps< T > > = {}
	): ItemProps< T > => ( {
		Icon: ( { value } ) => <span>Item Icon - { value?.value as string }</span>,
		Label: ( { value } ) => <span>Item label - { value?.value as string }</span>,
		Content: ( { bind } ) => <span>Content - { bind }</span>,
		...overrides,
	} );

	const defaultInitialValues = {
		$$type: 'example',
		value: 'Hello World',
	};

	it( 'should render the unstable repeater with no items', () => {
		// Arrange.
		const setValues = jest.fn();

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<Header>
					<Label>Test Repeater</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initial={ defaultInitialValues } values={ [] } setValues={ setValues }>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Test Repeater' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add item' } ) ).toBeInTheDocument();
		expect( screen.queryByText( /Item Icon/ ) ).not.toBeInTheDocument();
		expect( screen.queryByText( /Item label/ ) ).not.toBeInTheDocument();
	} );

	it( 'should render the unstable repeater with initial items', () => {
		// Arrange.
		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'First Item',
			},
			{
				$$type: 'example',
				value: 'Second Item',
			},
		];

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<Header>
					<Label>Test Repeater</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initial={ defaultInitialValues } values={ values } setValues={ setValues }>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Item Icon - First Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item label - First Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item Icon - Second Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item label - Second Item' ) ).toBeInTheDocument();
	} );

	it( 'should add a new item when the add button is clicked', () => {
		// Arrange.
		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'Existing Item',
			},
		];

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<Header>
					<Label>Test Repeater</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initial={ defaultInitialValues } values={ values } setValues={ setValues }>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );
		fireEvent.click( addButton );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( [
			{
				$$type: 'example',
				value: 'Existing Item',
			},
			defaultInitialValues,
		] );
	} );

	it( 'should render item content when item is opened', () => {
		// Arrange.
		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'Test Item',
			},
		];

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<Header>
					<Label>Test Repeater</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initial={ defaultInitialValues } values={ values } setValues={ setValues }>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		const openItemButton = screen.getByRole( 'button', { name: 'Open item' } );
		fireEvent.click( openItemButton );

		// Assert.
		expect( screen.getByText( 'Content - 0' ) ).toBeInTheDocument();
	} );

	it( 'should render proper item indexes for multiple items', () => {
		// Arrange.
		const setValues = jest.fn();
		const values = Array( 3 ).fill( defaultInitialValues );

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<Header>
					<Label>Test Repeater</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initial={ defaultInitialValues } values={ values } setValues={ setValues }>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		const openItemButtons = screen.getAllByRole( 'button', { name: 'Open item' } );
		// Open the second item (index 1)
		fireEvent.click( openItemButtons[ 1 ] );

		// Assert.
		expect( screen.getByText( 'Content - 1' ) ).toBeInTheDocument();
	} );

	it( 'should render without header when header is not provided', () => {
		// Arrange.
		const setValues = jest.fn();

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<ItemsContainer initial={ defaultInitialValues } values={ [] } setValues={ setValues }>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.queryByText( 'Test Repeater' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Add item' } ) ).not.toBeInTheDocument();
	} );

	it( 'should handle items with different value types', () => {
		// Arrange.
		const customItemSettings = createItemSettings( {
			Icon: ( { value }: { value: { title: string; id: number } } ) => <span>Icon-{ value.id }</span>,
			Label: ( { value }: { value: { title: string; id: number } } ) => <span>{ value.title }</span>,
		} );

		const customInitialValues = {
			$$type: 'custom',
			title: 'Default Title',
			id: 0,
		};

		const values = [
			{
				$$type: 'custom',
				title: 'Custom Item',
				id: 42,
			},
		];

		const setValues = jest.fn();

		// Act.
		renderWithTheme(
			<UnstableRepeater>
				<Header>
					<Label>Custom Repeater</Label>
					<AddItemAction />
				</Header>
				<ItemsContainer initial={ customInitialValues } values={ values } setValues={ setValues }>
					<Item { ...customItemSettings } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Icon-42' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Custom Item' ) ).toBeInTheDocument();
	} );
} );

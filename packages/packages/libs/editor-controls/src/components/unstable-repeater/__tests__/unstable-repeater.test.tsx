import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { AddItemAction } from '../actions/add-item-action';
import { Header } from '../header/header';
import { Item } from '../items/item';
import { ItemsContainer } from '../items/items-container';
import { type ItemProps } from '../types';
import { UnstableRepeater } from '../unstable-repeater';

jest.mock( '../../../bound-prop-context/use-bound-prop' );

const defaultInitialValues = {
	$$type: 'example',
	value: 'Hello World',
};

const defaultProps = {
	initial: defaultInitialValues,
	propTypeUtil: createMockPropType( { kind: 'array' } ),
};

const globalUseBoundPropArgs = {
	bind: '',
	propType: createMockPropType.prototype,
	path: [],
	restoreValue: jest.fn(),
};

describe( 'UnstableRepeater', () => {
	beforeEach( () => {
		jest.mocked( useBoundProp ).mockReturnValue( {
			value: [],
			setValue: jest.fn(),
			...globalUseBoundPropArgs,
		} );
	} );

	it( 'should render the unstable repeater with no items', () => {
		// Arrange.

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: [],
			setValue: jest.fn(),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps }>
				<Header label={ 'Test Repeater' }>
					<AddItemAction />
				</Header>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Test Repeater' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add item' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Open item' } ) ).not.toBeInTheDocument();
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

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValues,
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps }>
				<Header label={ 'Test Repeater' }>
					<AddItemAction />
				</Header>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Item Icon - First Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item label - First Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item Icon - Second Item' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item label - Second Item' ) ).toBeInTheDocument();

		const openItemButtons = screen.getAllByRole( 'button', { name: 'Open item' } );
		expect( openItemButtons ).toHaveLength( 2 );
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

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValues,
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps }>
				<Header label={ 'Test Repeater' }>
					<AddItemAction />
				</Header>
				<ItemsContainer>
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

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValues,
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps }>
				<Header label={ 'Test Repeater' }>
					<AddItemAction />
				</Header>
				<ItemsContainer>
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

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValues,
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps }>
				<Header label={ 'Test Repeater' }>
					<AddItemAction />
				</Header>
				<ItemsContainer>
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

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: [],
			setValue: setValues,
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps }>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.queryByText( 'Test Repeater' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Add item' } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Open item' } ) ).not.toBeInTheDocument();
	} );

	it( 'should handle items with different value types', () => {
		// Arrange.
		const customItemSettings = createItemSettings< { title: string; id: number } >( {
			Icon: ( { value } ) => <span>Icon-{ value.id }</span>,
			Label: ( { value } ) => <span>{ value.title }</span>,
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

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValues,
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<UnstableRepeater { ...defaultProps } initial={ customInitialValues }>
				<Header label={ 'Test Repeater' }>
					<AddItemAction />
				</Header>
				<ItemsContainer>
					<Item { ...customItemSettings } />
				</ItemsContainer>
			</UnstableRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Icon-42' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Custom Item' ) ).toBeInTheDocument();
	} );
} );

const createItemSettings = < T extends Record< string, unknown > = Record< string, unknown > >(
	overrides: Partial< ItemProps< T > > = {}
): ItemProps< T > => ( {
	Icon: ( { value } ) => <span>Item Icon - { String( ( value as Record< string, unknown > )?.value || '' ) }</span>,
	Label: ( { value } ) => <span>Item label - { String( ( value as Record< string, unknown > )?.value || '' ) }</span>,
	Content: ( { bind } ) => <span>Content - { bind }</span>,
	...overrides,
} );

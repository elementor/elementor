import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { usePropContext } from '../../../bound-prop-context';
import { useBoundProp } from '../../../bound-prop-context/use-bound-prop';
import { RepeaterHeader } from '../../repeater/repeater-header';
import { DisableItemAction } from '../actions/disable-item-action';
import { DuplicateItemAction } from '../actions/duplicate-item-action';
import { RemoveItemAction } from '../actions/remove-item-action';
import { TooltipAddItemAction } from '../actions/tooltip-add-item-action';
import { ControlRepeater } from '../control-repeater';
import { EditItemPopover } from '../items/edit-item-popover';
import { Item } from '../items/item';
import { ItemsContainer } from '../items/items-container';
import { type ItemProps, type RepeatablePropValue } from '../types';

jest.mock( '../../../bound-prop-context/use-bound-prop' );
jest.mock( '../../../bound-prop-context' );

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
	resetValue: jest.fn(),
};

const setValuesWrapper = ( setValues: ( value: unknown ) => void ) => {
	return ( value: unknown ) => {
		setValues( value );
	};
};

describe( 'ControlRepeater', () => {
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
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Test Repeater' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: /Add test repeater item/i } ) ).toBeInTheDocument();
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
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
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
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		const addButton = screen.getByRole( 'button', { name: /Add test repeater item/i } );
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

	it.skip( 'should render item content when item is opened', async () => {
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
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		jest.mocked( usePropContext ).mockReturnValue( {
			value: values[ 0 ],
		} as never );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		const openItemButton = screen.getByRole( 'button', { name: 'Open item' } );
		fireEvent.click( openItemButton );

		// Assert.
		expect( screen.getByText( 'Content - 0' ) ).toBeInTheDocument();
	} );

	it.skip( 'should render proper item indexes for multiple items', () => {
		// Arrange.
		const setValues = jest.fn();
		const values = Array( 3 ).fill( defaultInitialValues );

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		jest.mocked( usePropContext ).mockReturnValue( {
			value: values[ 1 ],
		} as never );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		const openItemButtons = screen.getAllByRole( 'button', { name: 'Open item' } );

		fireEvent.click( openItemButtons[ 1 ] );

		// Assert.
		expect( screen.getByText( 'Content - 1' ) ).toBeInTheDocument();
	} );

	it( 'should render without header when header is not provided', () => {
		// Arrange.
		const setValues = jest.fn();

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: [],
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<ItemsContainer>
					<Item { ...createItemSettings() } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		// Assert.
		expect( screen.queryByText( 'Test Repeater' ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: /Add test repeater item/i } ) ).not.toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Open item' } ) ).not.toBeInTheDocument();
	} );

	it( 'should handle items with different value types', () => {
		// Arrange.
		const customItemSettings = createItemSettings< {
			title: string;
			id: number;
			$$type: 'custom';
			value: 'custom-value';
		} >( {
			Icon: ( { value } ) => <span>Icon-{ value.id }</span>,
			Label: ( { value } ) => <span>{ value.title }</span>,
		} );

		const customInitialValues = {
			$$type: 'custom',
			value: null,
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
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps } initial={ customInitialValues }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...customItemSettings } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		// Assert.
		expect( screen.getByText( 'Icon-42' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Custom Item' ) ).toBeInTheDocument();
	} );

	it( 'should duplicate an item when the duplicate button is clicked, and add it right after the clicked item', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
		};

		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
			{
				$$type: 'example',
				value: 'Second item',
			},
		];

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...itemSettings } actions={ <DuplicateItemAction /> } />
				</ItemsContainer>
				<EditItemPopover>Content</EditItemPopover>
			</ControlRepeater>
		);

		// eslint-disable-next-line testing-library/no-node-access
		const duplicateButton = document.querySelector( 'button[aria-label="Duplicate"]' );

		fireEvent.click( duplicateButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( [
			{
				$$type: 'example',
				value: 'First item',
			},
			{
				$$type: 'example',
				value: 'First item',
			},
			{
				$$type: 'example',
				value: 'Second item',
			},
		] );
	} );

	it( 'should remove the item when the remove button is clicked', () => {
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
		};

		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
			{
				$$type: 'example',
				value: 'Second item',
			},
		];

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps }>
				<RepeaterHeader label={ 'Test Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Test repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...itemSettings } actions={ <RemoveItemAction /> } />
				</ItemsContainer>
				<EditItemPopover>Content</EditItemPopover>
			</ControlRepeater>
		);

		// eslint-disable-next-line testing-library/no-node-access
		const removeButton = document.querySelector( 'button[aria-label="Remove"]' );

		fireEvent.click( removeButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( [
			{
				$$type: 'example',
				value: 'Second item',
			},
		] );
	} );

	it( 'should disable the item when the disable button is clicked', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
		};

		const initialValues = {
			$$type: 'example',
			value: 'Hello World',
		};

		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
		];

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps } initial={ initialValues }>
				<RepeaterHeader label={ 'Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...itemSettings } actions={ <DisableItemAction /> } />
				</ItemsContainer>
				<EditItemPopover>Content</EditItemPopover>
			</ControlRepeater>
		);

		// eslint-disable-next-line testing-library/no-node-access
		const disableButton = document.querySelector( 'button[aria-label="Hide"]' );

		fireEvent.click( disableButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( [
			{
				$$type: 'example',
				value: 'First item',
				disabled: true,
			},
		] );
	} );

	it( 'should remove the disabled property when the enable button is clicked', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
		};

		const initialValues = {
			$$type: 'example',
			value: 'First item',
			disabled: true,
		};

		const setValues = jest.fn();
		const values = [ initialValues ];

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: values,
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps } initial={ initialValues }>
				<RepeaterHeader label={ 'Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...itemSettings } actions={ <DisableItemAction /> } />
				</ItemsContainer>
				<EditItemPopover>Content</EditItemPopover>
			</ControlRepeater>
		);

		// eslint-disable-next-line testing-library/no-node-access
		const enableButton = document.querySelector( 'button[aria-label="Show"]' );

		fireEvent.click( enableButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith( [
			{
				$$type: 'example',
				value: 'First item',
			},
		] );
	} );

	it.skip( 'should open the added repeater item popover', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
		};

		const initialValues = {
			$$type: 'example',
			value: 'First item',
			disabled: true,
		};

		const setValues = jest.fn();

		jest.mocked( useBoundProp ).mockReturnValue( {
			value: [],
			setValue: setValuesWrapper( setValues ),
			...globalUseBoundPropArgs,
		} );

		jest.mocked( usePropContext ).mockReturnValue( {
			value: initialValues,
		} as never );

		// Act.
		renderWithTheme(
			<ControlRepeater { ...defaultProps } initial={ initialValues }>
				<RepeaterHeader label={ 'Repeater' }>
					<TooltipAddItemAction ariaLabel={ 'Repeater' } />
				</RepeaterHeader>
				<ItemsContainer>
					<Item { ...itemSettings } />
				</ItemsContainer>
				<EditItemPopover>
					<Content />
				</EditItemPopover>
			</ControlRepeater>
		);

		const addButton = screen.getByRole( 'button', { name: /Add repeater item/i } );

		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByText( 'Content - 0' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByText( 'Content - 0' ) ).toBeInTheDocument();
	} );
} );

const createItemSettings = < T extends RepeatablePropValue = RepeatablePropValue >(
	overrides: Partial< ItemProps< T > > = {}
): ItemProps< T > => ( {
	Icon: ( { value } ) => <span>Item Icon - { String( ( value as T )?.value || '' ) }</span>,
	Label: ( { value } ) => <span>Item label - { String( ( value as T )?.value || '' ) }</span>,
	...overrides,
} );

const Content = ( { bind = 0 }: { bind?: string | number } ) => {
	return <span>Content - { bind }</span>;
};

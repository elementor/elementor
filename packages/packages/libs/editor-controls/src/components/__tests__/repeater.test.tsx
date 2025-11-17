import * as React from 'react';
import { useState } from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { Repeater, type RepeaterItem } from '../repeater/repeater';

describe( 'Repeater', () => {
	it( 'should render the repeater with no items', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ [] } setValues={ jest.fn() } />
		);

		// Assert.
		expect( screen.getByText( 'Repeater' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Add item' } ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Item Icon' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'Item label' ) ).not.toBeInTheDocument();
	} );

	it( 'should render the repeater with initial item, and pass the value to its components', () => {
		// Arrange.
		const Icon = ( { value }: { value: { value: string } } ) => <span>Item Icon - { value.value }</span>;
		const Label = ( { value }: { value: { value: string } } ) => <span>Item label - { value.value }</span>;

		const itemSettings = {
			Icon,
			Label,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		// Act.
		renderWithTheme(
			<Repeater
				label={ 'Repeater' }
				itemSettings={ itemSettings }
				values={ [ itemSettings.initialValues ] }
				setValues={ jest.fn() }
			/>
		);

		// Assert.
		expect( screen.getByText( 'Item Icon - Hello World' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Item label - Hello World' ) ).toBeInTheDocument();
	} );

	it( 'should add a new item to the bottom when the add button is clicked', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Initial item',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const values = [
			{
				$$type: 'example',
				value: 'Hello World',
			},
		];

		const setValues = jest.fn();

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } setValues={ setValues } values={ values } />
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );

		fireEvent.click( addButton );

		// Assert.
		expect( setValues ).toHaveBeenCalledTimes( 1 );
		expect( setValues ).toHaveBeenCalledWith(
			[ ...values, itemSettings.initialValues ],
			{},
			{
				action: { type: 'add', payload: [ { index: 1, item: itemSettings.initialValues } ] },
			}
		);
	} );

	it( 'should duplicate an item when the duplicate button is clicked, and add it right after the clicked item', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
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

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ values } setValues={ setValues } />
		);
		// eslint-disable-next-line testing-library/no-node-access
		const duplicateButton = document.querySelector( 'button[aria-label="Duplicate"]' );

		fireEvent.click( duplicateButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			[
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
			],
			{},
			{ action: { type: 'duplicate', payload: [ { index: 0, item: values[ 0 ] } ] } }
		);
	} );

	it( 'should remove the item when the remove button is clicked', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
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

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ values } setValues={ setValues } />
		);
		// eslint-disable-next-line testing-library/no-node-access
		const removeButton = document.querySelector( 'button[aria-label="Remove"]' );

		fireEvent.click( removeButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			[
				{
					$$type: 'example',
					value: 'Second item',
				},
			],
			{},
			{ action: { type: 'remove', payload: [ { index: 0, item: values[ 0 ] } ] } }
		);
	} );

	it( 'should render the item content and pass the index as bind prop', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: ( { bind }: { bind: string } ) => <span>Content - { bind }</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const setValues = jest.fn();
		const values = Array( 3 ).fill( itemSettings.initialValues );

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ values } setValues={ setValues } />
		);

		const [ , secondItem ] = screen.getAllByRole( 'button', { name: 'Open item' } );

		fireEvent.click( secondItem );

		// Assert.
		expect( screen.getByText( 'Content - 1' ) ).toBeInTheDocument();
	} );

	it( 'should disable the item when the disable button is clicked', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const setValues = jest.fn();
		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
		];

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ values } setValues={ setValues } />
		);
		// eslint-disable-next-line testing-library/no-node-access
		const disableButton = document.querySelector( 'button[aria-label="Hide"]' );

		fireEvent.click( disableButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			[
				{
					$$type: 'example',
					value: 'First item',
					disabled: true,
				},
			],
			{},
			{ action: { type: 'toggle-disable' } }
		);
	} );

	it( 'should remove the disabled property when the enable button is clicked', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'First item',
				disabled: true,
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const setValues = jest.fn();
		const values = [ itemSettings.initialValues ];

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ values } setValues={ setValues } />
		);
		// eslint-disable-next-line testing-library/no-node-access
		const enableButton = document.querySelector( 'button[aria-label="Show"]' );

		fireEvent.click( enableButton as Element );

		// Assert.
		expect( setValues ).toHaveBeenCalledWith(
			[
				{
					$$type: 'example',
					value: 'First item',
				},
			],
			{},
			{ action: { type: 'toggle-disable' } }
		);
	} );

	it( 'should open the last repeater item popover, if the newly added item was added to bottom and "openOnAdd" is true', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: ( { bind }: { bind: string } ) => <span>Content - { bind }</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		type TestItem = RepeaterItem< { $$type: string; value: string } >;

		const TestWrapper = () => {
			const [ values, setValues ] = useState< TestItem[] >( [] );

			return (
				<Repeater
					openOnAdd
					label={ 'Repeater' }
					itemSettings={ itemSettings }
					values={ values }
					setValues={ setValues }
				/>
			);
		};

		// Act.
		renderWithTheme( <TestWrapper /> );

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );

		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByText( 'Content - 0' ) ).toBeInTheDocument();

		// Act.
		fireEvent.click( addButton );

		// Assert.
		expect( screen.getByText( 'Content - 1' ) ).toBeInTheDocument();
	} );

	it( 'should not open the added item popover when "openOnAdd" prop not passed', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		// Act.
		renderWithTheme(
			<Repeater label={ 'Repeater' } itemSettings={ itemSettings } values={ [] } setValues={ jest.fn() } />
		);

		const addButton = screen.getByRole( 'button', { name: 'Add item' } );

		fireEvent.click( addButton );

		// Assert.
		expect( screen.queryByText( 'Content' ) ).not.toBeInTheDocument();
	} );

	it( 'should hide the duplicate button when showDuplicate is false', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
		];

		// Act.
		renderWithTheme(
			<Repeater
				label={ 'Repeater' }
				itemSettings={ itemSettings }
				values={ values }
				setValues={ jest.fn() }
				showDuplicate={ false }
			/>
		);

		// Assert.
		const duplicateButton = screen.queryByRole( 'button', { name: 'Duplicate' } );
		expect( duplicateButton ).not.toBeInTheDocument();
	} );

	it( 'should hide the toggle button when showToggle is false', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'Hello World',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
		];

		// Act.
		renderWithTheme(
			<Repeater
				label={ 'Repeater' }
				itemSettings={ itemSettings }
				values={ values }
				setValues={ jest.fn() }
				showToggle={ false }
			/>
		);

		// Assert.
		const toggleButton = screen.queryByLabelText( 'Hide' );
		expect( toggleButton ).not.toBeInTheDocument();
	} );

	it( 'should hide the remove button when showRemove is false', () => {
		// Arrange.
		const itemSettings = {
			Icon: () => <span>Item Icon</span>,
			Label: () => <span>Item label</span>,
			Content: () => <span>Content</span>,
			initialValues: {
				$$type: 'example',
				value: 'First item',
			},
			getId: ( { index }: { index: number } ) => `item-${ index }`,
		};

		const values = [
			{
				$$type: 'example',
				value: 'First item',
			},
		];

		// Act.
		renderWithTheme(
			<Repeater
				label={ 'Repeater' }
				itemSettings={ itemSettings }
				values={ values }
				setValues={ jest.fn() }
				showRemove={ false }
			/>
		);

		// Assert.
		const removeButton = screen.queryByLabelText( 'Remove' );
		expect( removeButton ).not.toBeInTheDocument();
	} );
} );

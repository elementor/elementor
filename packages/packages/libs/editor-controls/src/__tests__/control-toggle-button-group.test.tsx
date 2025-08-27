import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { ControlActionsProvider } from '@elementor/editor-controls';
import { fireEvent, screen, within } from '@testing-library/react';

import { ControlToggleButtonGroup, type ToggleButtonGroupItem } from '../components/control-toggle-button-group';

const MockIcon = ( { fontSize }: { fontSize: string } ) => <div>{ fontSize }</div>;
const mockBaseItems = [
	{
		value: 1,
		label: 'One',
		renderContent: () => 'One',
	},
	{
		value: 2,
		label: 'Two',
		renderContent: () => 'Two',
	},
	{
		value: 3,
		label: 'Three',
		renderContent: () => 'Three',
	},
	{
		value: 4,
		label: 'Four',
		renderContent: () => 'Four',
	},
];

const mockSplitItems = [
	{
		value: 5,
		label: 'Five',
		renderContent: () => 'Five',
	},
	{
		value: 6,
		label: 'Six',
		renderContent: () => 'Six',
	},
];

const propType = createMockPropType( {
	kind: 'plain',
} );

const renderControlToggleButtonGroup = ( component: React.ReactElement ) => {
	return renderControl( component, {} as never );
};

describe( 'ControlToggleButtonGroup', () => {
	afterEach( () => {
		jest.resetAllMocks();
	} );

	it( 'should render the items and leave them unchecked if not in the control value', () => {
		// Arrange.
		const onChange = jest.fn();

		// Act.
		renderControlToggleButtonGroup(
			<ControlToggleButtonGroup value={ null } items={ mockBaseItems } onChange={ onChange } exclusive />
		);

		// Assert.
		mockBaseItems.forEach( ( item ) => {
			const button = screen.getByRole( 'button', { name: item.label } );
			expect( button ).not.toHaveAttribute( 'aria-pressed', 'true' );
		} );
	} );

	it( 'should propagate size prop to icon', () => {
		// Arrange.
		const onChange = jest.fn();
		const localItems = mockBaseItems.map( ( item ) => ( {
			...item,
			renderContent: ( { size = 'tiny' } ) => <MockIcon fontSize={ size } />,
		} ) );

		const props = { propType };

		// Act.
		const { rerender } = renderControl(
			<ControlActionsProvider items={ [] }>
				<ControlToggleButtonGroup
					value={ null }
					items={ localItems }
					onChange={ onChange }
					size="large"
					exclusive
				/>
			</ControlActionsProvider>,
			props
		);

		// Assert.
		localItems.forEach( ( item ) => {
			const button = screen.getByRole( 'button', { name: item.label } );

			const icon = within( button ).getByText( 'large' );

			expect( icon ).toBeInTheDocument();
		} );

		// Act.
		rerender(
			<ControlToggleButtonGroup
				value={ null }
				items={ localItems }
				onChange={ onChange }
				size="small"
				exclusive
			/>
		);

		// Assert.
		localItems.forEach( ( item ) => {
			const button = screen.getByRole( 'button', { name: item.label } );

			const icon = within( button ).getByText( 'small' );

			expect( icon ).toBeInTheDocument();
		} );
	} );

	it( 'should render selected buttons corresponding to value', () => {
		// Arrange.
		const onChange = jest.fn();

		// Act.
		renderControlToggleButtonGroup(
			<ControlToggleButtonGroup value={ 2 } items={ mockBaseItems } onChange={ onChange } exclusive />
		);

		// Assert.
		mockBaseItems.forEach( ( item ) => {
			const button = screen.getByRole( 'button', { name: item.label } );

			if ( 2 === item.value ) {
				expect( button ).toHaveAttribute( 'aria-pressed', 'true' );
			} else {
				expect( button ).not.toHaveAttribute( 'aria-pressed', 'true' );
			}
		} );
	} );

	it( 'should invoke onChange with null when the selected button is clicked', () => {
		// Arrange.
		const onChange = jest.fn();

		// Act.
		renderControlToggleButtonGroup(
			<ControlToggleButtonGroup value={ 1 } items={ mockBaseItems } onChange={ onChange } exclusive />
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'One' } ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( null );
	} );

	it( 'should invoke onChange with the new value when a different button is clicked', () => {
		// Arrange.
		const onChange = jest.fn();

		// Act.
		renderControlToggleButtonGroup(
			<ControlToggleButtonGroup value={ 1 } items={ mockBaseItems } onChange={ onChange } exclusive />
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Two' } ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( 2 );
	} );

	it( 'should handle arrays when not exclusive toggle group', () => {
		// Arrange.
		const onChange = jest.fn();
		const props = { propType };

		// Act.
		const { rerender } = renderControl(
			<ControlActionsProvider items={ [] }>
				<ControlToggleButtonGroup value={ [ 1 ] } items={ mockBaseItems } onChange={ onChange } />
			</ControlActionsProvider>,
			props
		);

		fireEvent.click( screen.getByRole( 'button', { name: 'Two' } ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( [ 1, 2 ] );

		// Act.
		rerender( <ControlToggleButtonGroup value={ [ 1, 2 ] } items={ mockBaseItems } onChange={ onChange } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'One' } ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( [ 2 ] );

		// Act.
		rerender( <ControlToggleButtonGroup value={ [ 2 ] } items={ mockBaseItems } onChange={ onChange } /> );

		fireEvent.click( screen.getByRole( 'button', { name: 'Two' } ) );

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( [] );
	} );

	it.each( [
		{ initValue: null, targetValue: 5, expectedSplitValue: 5 },
		{ initValue: 6, targetValue: 6, expectedSplitValue: 6 },
		{ initValue: 6, targetValue: 2, expectedSplitValue: 6 },
		{ initValue: 3, targetValue: 4, expectedSplitValue: 5 },
		{ initValue: 3, targetValue: 3, expectedSplitValue: 5 },
		{ initValue: 6, targetValue: 6, expectedSplitValue: 6 },
		{ initValue: 6, targetValue: 3, expectedSplitValue: 6 },
	] )( 'should handle split items', async ( { initValue, targetValue, expectedSplitValue } ) => {
		// Arrange.
		const onChange = jest.fn();

		const initIndexInSplit = mockSplitItems.findIndex( ( { value } ) => initValue === value );
		const targetIndexInSplit = mockSplitItems.findIndex( ( { value } ) => targetValue === value );
		const expectedSplitItem = mockSplitItems.find(
			( { value } ) => value === expectedSplitValue
		) as ToggleButtonGroupItem< number >;

		// Act.
		renderControlToggleButtonGroup(
			<ControlToggleButtonGroup
				value={ initValue }
				items={ [ ...mockBaseItems, ...mockSplitItems ] }
				maxItems={ 5 }
				onChange={ onChange }
				exclusive
			/>
		);

		// Assert.
		expect( getCurrentSplitButton() ).toHaveTextContent( mockSplitItems[ Math.max( 0, initIndexInSplit ) ].label );

		// Act.
		if ( targetIndexInSplit !== -1 ) {
			fireEvent.click( getSplitTriggerButton() );

			const splitItem = getItem( mockSplitItems[ targetIndexInSplit ].label );

			fireEvent.click( splitItem );
		} else {
			const targetItem = mockBaseItems.find(
				( { value } ) => value === targetValue
			) as ToggleButtonGroupItem< number >;

			fireEvent.click( getItem( targetItem.label ) );
		}

		// Assert.
		expect( onChange ).toHaveBeenCalledWith( initValue === targetValue ? null : targetValue );
		expect( getCurrentSplitButton() ).toHaveTextContent( expectedSplitItem.label );
	} );
} );

function getCurrentSplitButton() {
	const buttons = screen.getAllByRole( 'button' );
	return buttons.slice( -2 )[ 0 ];
}

function getSplitTriggerButton() {
	const buttons = screen.getAllByRole( 'button' );
	return buttons.slice( -1 )[ 0 ];
}

function getItem( label: string ) {
	return screen.getAllByText( label ).slice( -1 )[ 0 ];
}

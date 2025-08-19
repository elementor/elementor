import * as React from 'react';
import { createMockPropType, renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { TransitionRepeaterControl } from '../transition-repeater-control';

jest.mock( '../../selection-size-control', () => ( {
	SelectionSizeControl: jest.fn( () => <div data-testid="selection-size-control">Mock Selection Size Control</div> ),
} ) );

jest.mock( '../transition-selector', () => ( {
	TransitionSelector: jest.fn( () => <div data-testid="transition-selector">Mock Transition Selector</div> ),
} ) );

const createTransitionPropType = () =>
	createMockPropType( {
		kind: 'array',
	} );

describe( 'TransitionRepeaterControl', () => {
	it( 'should render with default empty state', () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'array', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

		// Assert
		expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
	} );

	it( 'should render with initial transition values', () => {
		// Arrange
		const setValue = jest.fn();
		const value = {
			$$type: 'array',
			value: [
				{
					$$type: 'selection-size',
					value: {
						selection: {
							$$type: 'key-value',
							value: {
								key: { $$type: 'string', value: 'All properties' },
								value: { $$type: 'string', value: 'all' },
							},
						},
						size: { $$type: 'size', value: { size: 200, unit: 'ms' } },
					},
				},
			],
		};
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );
		const addButton = screen.getByRole( 'button' );
		fireEvent.click( addButton );

		// Assert
		expect( screen.getByText( 'Transitions' ) ).toBeInTheDocument();
		expect( screen.getByText( ( content ) => content.includes( 'All properties' ) ) ).toBeInTheDocument();
	} );

	it( 'should display an enabled add button when rendered in normal style state', () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'array', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl( <TransitionRepeaterControl currentStyleState={ null } recentlyUsedList={ [] } />, props );

		// Assert
		const addButton = screen.getByLabelText( 'Add item' );
		expect( addButton ).toBeInTheDocument();
		expect( addButton ).toBeEnabled();
	} );

	it( 'should display a disabled add button when not in normal style state', () => {
		// Arrange
		const setValue = jest.fn();
		const value = { $$type: 'array', value: [] };
		const propType = createTransitionPropType();
		const props = { setValue, value, bind: 'transition', propType };

		// Act
		renderControl( <TransitionRepeaterControl currentStyleState={ 'hover' } recentlyUsedList={ [] } />, props );

		// Assert
		const addButton = screen.getByLabelText( 'Add item' );
		expect( addButton ).toBeInTheDocument();
		expect( addButton ).toBeDisabled();
	} );
} );

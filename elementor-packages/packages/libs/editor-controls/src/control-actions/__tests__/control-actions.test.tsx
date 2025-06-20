import * as React from 'react';
import { renderControl } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import ControlActions from '../control-actions';
import { ControlActionsProvider } from '../control-actions-context';

describe( 'ControlActions', () => {
	it( 'should register the component and show its content on hover', () => {
		const items = [
			{
				id: 'test-0',
				MenuItem: () => <div>{ 'Test 0 icon' }</div>,
			},
		];

		renderControl(
			<ControlActionsProvider items={ items }>
				<ControlActions>
					<input type="text" />
				</ControlActions>
			</ControlActionsProvider>,
			{} as never
		);

		// Assert.
		expect( screen.queryByText( 'Test 0 icon' ) ).not.toBeInTheDocument();

		// Act.
		fireEvent.mouseEnter( screen.getByRole( 'textbox' ) );

		// // Assert.
		expect( screen.getByText( 'Test 0 icon' ) ).toBeInTheDocument();
	} );

	it( 'should not render the component if no items are registered', () => {
		// Act.
		renderControl(
			<ControlActionsProvider items={ [] }>
				<ControlActions>
					<input type="text" />
				</ControlActions>
			</ControlActionsProvider>,
			{} as never
		);

		fireEvent.mouseEnter( screen.getByRole( 'textbox' ) );

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Test 0 icon' ) ).not.toBeInTheDocument();
	} );

	it( 'should not render the component if the bound prop is disabled', () => {
		// Arrange.
		const items = [
			{
				id: 'test-0',
				MenuItem: () => <div>{ 'Test 0 icon' }</div>,
			},
		];

		// Act.
		renderControl(
			<ControlActionsProvider items={ items }>
				<ControlActions>
					<input type="text" />
				</ControlActions>
			</ControlActionsProvider>,
			{
				disabled: true,
			} as never
		);

		fireEvent.mouseEnter( screen.getByRole( 'textbox' ) );

		// Assert.
		expect( screen.getByRole( 'textbox' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Test 0 icon' ) ).not.toBeInTheDocument();
	} );
} );

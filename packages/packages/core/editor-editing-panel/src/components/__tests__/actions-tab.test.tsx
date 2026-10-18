import * as React from 'react';
import { createMockElementType, renderWithTheme } from 'test-utils';
import { getElementActions, updateElementActions } from '@elementor/editor-elements';
import { fireEvent, screen } from '@testing-library/react';

import { ElementProvider } from '../../contexts/element-context';
import { ActionsTab } from '../actions-tab';
import { actionsToProps, type PlainAction } from '../data-flow/actions/actions-props';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementActions: jest.fn(),
	updateElementActions: jest.fn(),
} ) );

const ELEMENT_ID = 'button-1';

const DEFINITIONS = [
	{
		name: 'state/toggle',
		label: 'Toggle state',
		description: 'Flips a boolean state key.',
		source: 'built-in',
		args: { key: { kind: 'plain', key: 'string' } },
	},
	{
		name: 'state/increment',
		label: 'Increment state',
		description: '',
		source: 'built-in',
		args: {
			key: { kind: 'plain', key: 'string' },
			by: { kind: 'plain', key: 'number' },
			wrap: { kind: 'plain', key: 'boolean' },
		},
	},
];

const givenActions = ( actions: PlainAction[] ) => {
	jest.mocked( getElementActions ).mockReturnValue( {
		version: 1,
		items: actionsToProps( actions, ( name ) => DEFINITIONS.find( ( d ) => d.name === name )?.args ?? {} ),
	} );
};

const lastSavedItems = () => jest.mocked( updateElementActions ).mock.lastCall?.[ 0 ].items ?? [];

const renderActionsTab = () => {
	const element = { id: ELEMENT_ID, type: 'e-button' };
	const elementType = createMockElementType( { key: 'e-button', title: 'Button' } );

	return renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ {} }>
			<ActionsTab />
		</ElementProvider>
	);
};

describe( '<ActionsTab />', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		window.elementor = { config: { dataFlow: { actions: DEFINITIONS } } } as never;
	} );

	it( 'should render the existing actions with their arguments', () => {
		// Arrange
		givenActions( [ { on: 'click', do: 'state/increment', args: { key: 'count', by: 2 } } ] );

		// Act
		renderActionsTab();

		// Assert
		expect( getElementActions ).toHaveBeenCalledWith( ELEMENT_ID );
		expect( screen.getByText( 'On click: Increment state' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'textbox', { name: 'key' } ) ).toHaveValue( 'count' );
		expect( screen.getByRole( 'textbox', { name: 'by' } ) ).toHaveValue( '2' );
	} );

	it( 'should save typed argument props when an argument changes', () => {
		// Arrange
		givenActions( [ { on: 'click', do: 'state/increment', args: { key: 'count' } } ] );
		renderActionsTab();

		// Act
		fireEvent.change( screen.getByRole( 'textbox', { name: 'by' } ), { target: { value: '5' } } );
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'wrap' } ) );

		// Assert
		const args = ( lastSavedItems()[ 0 ].value.action as { value: { args: { value: unknown } } } ).value.args.value;
		expect( args ).toEqual( {
			key: { $$type: 'string', value: 'count' },
			by: { $$type: 'number', value: 5 },
			wrap: { $$type: 'boolean', value: true },
		} );
	} );

	it( 'should add an event action and a motion input', () => {
		// Arrange
		givenActions( [] );
		renderActionsTab();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Event' } ) );
		fireEvent.click( screen.getByRole( 'button', { name: 'Motion input' } ) );

		// Assert
		expect( lastSavedItems().map( ( item ) => item.$$type ) ).toEqual( [ 'event-action', 'input-action' ] );
		expect( screen.getByText( 'Follow pointer' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'textbox', { name: 'Write to state key' } ) ).toHaveValue( 'tilt_x' );
	} );

	it( 'should remove an action', () => {
		// Arrange
		givenActions( [ { on: 'click', do: 'state/toggle', args: { key: 'open' } } ] );
		renderActionsTab();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Remove action' } ) );

		// Assert
		expect( updateElementActions ).toHaveBeenCalledWith( { elementId: ELEMENT_ID, items: [] } );
		expect( screen.queryByText( 'On click: Toggle state' ) ).not.toBeInTheDocument();
	} );
} );

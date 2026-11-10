import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieVariableFormHeaderAction } from '../angie-variable-form-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const BUTTON_NAME = 'Generate with Angie';

describe( 'AngieVariableFormHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it.each( [
		{
			scenario: 'creation without a label',
			props: { variableType: 'color' },
			prompt: 'For new color variable I want: ',
		},
		{
			scenario: 'edit with a label',
			props: { variableType: 'color', variableId: 'var-1', label: 'Primary' },
			prompt: 'For color variable "Primary" I want: ',
		},
	] )( 'opens Angie with the $scenario prompt when clicked', ( { props, prompt } ) => {
		// Arrange
		render( <AngieVariableFormHeaderAction { ...props } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( prompt );
	} );
} );

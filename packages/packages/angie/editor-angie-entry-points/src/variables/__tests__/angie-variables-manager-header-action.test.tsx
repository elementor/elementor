import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieVariablesManagerHeaderAction } from '../angie-variables-manager-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const BUTTON_NAME = 'Generate with Angie';
const PROMPT = 'In the design system variables, I want: ';

describe( 'AngieVariablesManagerHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the variables manager prompt when clicked', () => {
		// Arrange
		render( <AngieVariablesManagerHeaderAction /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( PROMPT );
	} );
} );

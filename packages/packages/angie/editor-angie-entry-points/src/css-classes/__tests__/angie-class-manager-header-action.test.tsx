import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieClassManagerHeaderAction } from '../angie-class-manager-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const BUTTON_NAME = 'Generate with Angie';
const PROMPT = 'In the design system global classes, I want: ';

describe( 'AngieClassManagerHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the class manager prompt when clicked', () => {
		// Arrange
		render( <AngieClassManagerHeaderAction /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( PROMPT );
	} );
} );

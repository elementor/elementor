import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieComponentsTabHeaderAction } from '../angie-components-tab-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const BUTTON_NAME = 'Generate with Angie';
const PROMPT = 'In components, I want: ';

describe( 'AngieComponentsTabHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the components tab prompt when clicked', () => {
		// Arrange
		render( <AngieComponentsTabHeaderAction /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( PROMPT );
	} );
} );

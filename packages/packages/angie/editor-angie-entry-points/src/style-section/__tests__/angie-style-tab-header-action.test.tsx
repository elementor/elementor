import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieStyleTabHeaderAction } from '../angie-style-tab-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'el-styles';
const BUTTON_NAME = 'Generate with Angie';
const PROMPT = `At element ${ ELEMENT_ID }, styles, I want: `;

describe( 'AngieStyleTabHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the style tab prompt when clicked', () => {
		// Arrange
		render( <AngieStyleTabHeaderAction elementId={ ELEMENT_ID } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( PROMPT );
	} );
} );

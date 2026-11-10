import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieInteractionsHeaderAction } from '../angie-interactions-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'element-88';
const BUTTON_NAME = 'Generate with Angie';

describe( 'AngieInteractionsHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the interactions prompt when clicked', () => {
		// Arrange
		render( <AngieInteractionsHeaderAction elementId={ ELEMENT_ID } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( `At element ${ ELEMENT_ID }, interactions, I want: ` );
	} );
} );

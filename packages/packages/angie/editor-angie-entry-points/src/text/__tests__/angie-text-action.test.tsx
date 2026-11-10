import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieTextAction } from '../angie-text-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'abc123';

describe( 'AngieTextAction', () => {
	it( 'opens Angie with a prompt naming the element when clicked', () => {
		// Arrange
		render( <AngieTextAction elementId={ ELEMENT_ID } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Generate with Angie' } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( `At element ${ ELEMENT_ID } I want: ` );
	} );
} );

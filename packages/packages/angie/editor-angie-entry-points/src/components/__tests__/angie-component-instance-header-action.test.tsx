import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieComponentInstanceHeaderAction } from '../angie-component-instance-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const BUTTON_NAME = 'Generate with Angie';

describe( 'AngieComponentInstanceHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the component instance prompt when clicked', () => {
		// Arrange
		render( <AngieComponentInstanceHeaderAction componentId="comp-1" elementId="el-9" /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( 'At component comp-1 (instance el-9) I want: ' );
	} );
} );

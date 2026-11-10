import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { AngieStyleSectionHeaderAction } from '../angie-style-section-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'element-42';
const BUTTON_NAME = 'Generate with Angie';

describe( 'AngieStyleSectionHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the style section prompt when clicked', () => {
		// Arrange
		render( <AngieStyleSectionHeaderAction elementId={ ELEMENT_ID } sectionName="Typography" /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: BUTTON_NAME } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith(
			`At element ${ ELEMENT_ID }, style section "Typography", I want: `
		);
	} );
} );

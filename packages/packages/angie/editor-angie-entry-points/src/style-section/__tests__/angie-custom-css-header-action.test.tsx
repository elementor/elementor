import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieCustomCssHeaderAction, CUSTOM_CSS_SECTION_NAME } from '../angie-custom-css-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'el-css';

describe( 'AngieCustomCssHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the custom CSS prompt when clicked', () => {
		// Arrange
		const props = { elementId: ELEMENT_ID, sectionName: CUSTOM_CSS_SECTION_NAME };
		render( <AngieCustomCssHeaderAction { ...props } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( ANGIE_PROMPTS.customCss( props ) );
	} );
} );

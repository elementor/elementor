import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieStyleSectionHeaderAction } from '../angie-style-section-header-action';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

const ELEMENT_ID = 'element-42';
const SECTION_NAME = 'Typography';

describe( 'AngieStyleSectionHeaderAction', () => {
	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the style section prompt when clicked', () => {
		// Arrange
		render( <AngieStyleSectionHeaderAction elementId={ ELEMENT_ID } sectionName={ SECTION_NAME } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith(
			ANGIE_PROMPTS.styleSection( { elementId: ELEMENT_ID, sectionName: SECTION_NAME } )
		);
	} );
} );

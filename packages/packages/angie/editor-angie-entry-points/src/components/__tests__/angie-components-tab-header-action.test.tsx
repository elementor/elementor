import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';
import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieComponentsTabHeaderAction } from '../angie-components-tab-header-action';
import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

describe( 'AngieComponentsTabHeaderAction', () => {
	beforeEach( () => {
		mockAngieEntryPointsEnabled();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the components tab prompt when clicked', () => {
		// Arrange
		render( <AngieComponentsTabHeaderAction /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( ANGIE_PROMPTS.componentsTab() );
	} );
} );

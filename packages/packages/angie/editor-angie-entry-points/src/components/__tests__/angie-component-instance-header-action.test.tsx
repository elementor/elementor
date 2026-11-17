import * as React from 'react';
import { openAngieInAgentMode } from '@elementor/editor-mcp';
import { fireEvent, render, screen } from '@testing-library/react';

import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';
import { getGenerateWithAngieLabel } from '../../labels';
import { ANGIE_PROMPTS } from '../../prompts';
import { AngieComponentInstanceHeaderAction } from '../angie-component-instance-header-action';
import { mockAngieEntryPointsEnabled } from '../../__tests__/mock-angie-entry-points-enabled';

jest.mock( '@elementor/editor-mcp', () => ( {
	openAngieInAgentMode: jest.fn(),
} ) );

describe( 'AngieComponentInstanceHeaderAction', () => {
	beforeEach( () => {
		mockAngieEntryPointsEnabled();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'opens Angie with the component instance prompt when clicked', () => {
		// Arrange
		const props = { componentId: 'comp-1', elementId: 'el-9' };
		render( <AngieComponentInstanceHeaderAction { ...props } /> );

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: getGenerateWithAngieLabel() } ) );

		// Assert
		expect( openAngieInAgentMode ).toHaveBeenCalledWith( ANGIE_PROMPTS.componentInstance( props ) );
	} );
} );

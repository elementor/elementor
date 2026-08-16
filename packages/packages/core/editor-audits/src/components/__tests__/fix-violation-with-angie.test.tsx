import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { ANGIE_FIX_ENTRY_POINT, CREATE_WIDGET_EVENT } from '../../constants';
import FixViolationWithAngie from '../fix-violation-with-angie';

const mockIsAngieAvailable = jest.fn();
const mockSendPromptToAngie = jest.fn();

jest.mock( '@elementor/editor-mcp', () => {
	const { toolPrompts } = jest.requireActual( '@elementor/editor-mcp' ) as { toolPrompts: unknown };

	return {
		toolPrompts,
		isAngieAvailable: () => mockIsAngieAvailable(),
		sendPromptToAngie: ( ...args: unknown[] ) => mockSendPromptToAngie( ...args ),
	};
} );

const PROMPT = 'Help me fix: Page has no title.';

describe( 'FixViolationWithAngie', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockSendPromptToAngie.mockReset();
	} );

	it( 'renders a link with the angie-prompt hash', () => {
		renderWithTheme( <FixViolationWithAngie prompt={ PROMPT } /> );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );

		expect( link ).toHaveAttribute( 'href', `#angie-prompt=${ encodeURIComponent( PROMPT ) }` );
	} );

	it( 'calls sendPromptToAngie when Angie is installed', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme( <FixViolationWithAngie prompt={ PROMPT } /> );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );
		const stopPropagation = jest.fn();
		const preventDefault = jest.fn();

		fireEvent.click( link, { stopPropagation, preventDefault } );

		expect( mockSendPromptToAngie ).toHaveBeenCalledWith( PROMPT );
	} );

	it( 'dispatches create-widget event when Angie is not installed', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		const handler = jest.fn();
		window.addEventListener( CREATE_WIDGET_EVENT, handler );

		renderWithTheme( <FixViolationWithAngie prompt={ PROMPT } /> );

		fireEvent.click( screen.getByRole( 'link', { name: 'Fix with Angie' } ) );

		expect( handler ).toHaveBeenCalledTimes( 1 );
		expect( handler.mock.calls[ 0 ][ 0 ] ).toMatchObject( {
			detail: {
				entry_point: ANGIE_FIX_ENTRY_POINT,
				prompt: PROMPT,
			},
		} );

		window.removeEventListener( CREATE_WIDGET_EVENT, handler );
	} );

	it( 'stops event propagation on click', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme( <FixViolationWithAngie prompt={ PROMPT } /> );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );
		const stopPropagation = jest.spyOn( event, 'stopPropagation' );
		const preventDefault = jest.spyOn( event, 'preventDefault' );

		link.dispatchEvent( event );

		expect( stopPropagation ).toHaveBeenCalled();
		expect( preventDefault ).toHaveBeenCalled();
	} );
} );

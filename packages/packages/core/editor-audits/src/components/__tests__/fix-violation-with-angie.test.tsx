import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { type AuditMeta } from '../../types';
import { trackFindingClicked } from '../../utils/tracking';
import FixViolationWithAngie from '../fix-violation-with-angie';

const mockIsAngieAvailable = jest.fn();
const mockSendPromptToAngie = jest.fn();

jest.mock( '../../utils/tracking' );

const AUDIT: AuditMeta = {
	id: 'audits/page-title',
	title: 'Page title',
	description: '',
	fixHint: '',
	categories: [ 'seo' ],
	severity: 'error',
	weight: 10,
};

jest.mock( '@elementor/editor-mcp', () => {
	const { toolPrompts } = jest.requireActual( '@elementor/editor-mcp' ) as { toolPrompts: unknown };

	return {
		toolPrompts,
		isAngieAvailable: () => mockIsAngieAvailable(),
		sendPromptToAngie: ( ...args: unknown[] ) => mockSendPromptToAngie( ...args ),
	};
} );

const PROMPT = 'Help me fix: Page has no title.';
const PANEL_Z_INDEX = 1000;

describe( 'FixViolationWithAngie', () => {
	beforeEach( () => {
		mockIsAngieAvailable.mockReset();
		mockSendPromptToAngie.mockReset();
		jest.mocked( trackFindingClicked ).mockClear();
	} );

	it( 'renders nothing when Angie is not installed', () => {
		mockIsAngieAvailable.mockReturnValue( false );

		const { container } = renderWithTheme(
			<FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } />
		);

		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders a link with the angie-prompt hash when Angie is installed', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme( <FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } /> );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );

		expect( link ).toHaveAttribute( 'href', `#angie-prompt=${ encodeURIComponent( PROMPT ) }` );
	} );

	it( 'calls sendPromptToAngie when Angie is installed', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme( <FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } /> );

		fireEvent.click( screen.getByRole( 'link', { name: 'Fix with Angie' } ) );

		expect( mockSendPromptToAngie ).toHaveBeenCalledWith( PROMPT );
	} );

	it( 'tracks the finding click when the prompt is sent to Angie', () => {
		mockIsAngieAvailable.mockReturnValue( true );
		renderWithTheme( <FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } /> );

		fireEvent.click( screen.getByRole( 'link', { name: 'Fix with Angie' } ) );

		expect( trackFindingClicked ).toHaveBeenCalledWith( {
			audit: AUDIT,
			locationL2: 'issues',
			actionType: 'fix_with_angie',
			interactionResult: 'angie_prompt_sent',
		} );
	} );

	it( 'stops event propagation on click', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme( <FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } /> );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );
		const event = new MouseEvent( 'click', { bubbles: true, cancelable: true } );
		const stopPropagation = jest.spyOn( event, 'stopPropagation' );
		const preventDefault = jest.spyOn( event, 'preventDefault' );

		link.dispatchEvent( event );

		expect( stopPropagation ).toHaveBeenCalled();
		expect( preventDefault ).toHaveBeenCalled();
	} );

	it( 'renders as an icon-only button with an accessible name but no visible text', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme( <FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } /> );

		expect( screen.getByRole( 'link', { name: 'Fix with Angie' } ) ).toHaveTextContent( '' );
	} );

	it( 'renders visible "Fix with Angie" text when variant is "button"', () => {
		mockIsAngieAvailable.mockReturnValue( true );

		renderWithTheme(
			<FixViolationWithAngie audit={ AUDIT } prompt={ PROMPT } panelZIndex={ PANEL_Z_INDEX } variant="button" />
		);

		expect( screen.getByRole( 'link', { name: 'Fix with Angie' } ) ).toHaveTextContent( 'Fix with Angie' );
	} );
} );

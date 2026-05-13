import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { useCurrentUserCapabilities } from '@elementor/editor-current-user';
import { act } from '@testing-library/react';

import { ANGIE_GUIDE_TOGGLE_EVENT } from '../../angie-consts';
import { AngieGuideLocation } from '../angie-guide-location';

const mockAngieGuideCardProps = jest.fn();

jest.mock( '../angie-guide-card', () => ( {
	AngieGuideCard: ( props: Record< string, unknown > ) => {
		mockAngieGuideCardProps( props );
		return <div data-testid="angie-guide-card" />;
	},
} ) );

jest.mock( '../../hooks/use-auto-show', () => ( {
	useAutoShow: jest.fn(),
} ) );

jest.mock( '@elementor/events', () => ( {
	useMixpanel: () => ( { dispatchEvent: jest.fn() } ),
} ) );

jest.mock( '@elementor/editor-current-user' );

const mockIsAdmin = ( isAdmin: boolean ) => {
	jest.mocked( useCurrentUserCapabilities ).mockReturnValue( {
		isAdmin,
		canUser: jest.fn(),
		capabilities: [],
	} );
};

// The toggle handler does document.querySelector('[aria-label="Angie"]') to set anchorEl.
// Without a matching element in the DOM, anchorEl stays null and the popover never opens.
const createAngieAnchor = () => {
	const anchor = document.createElement( 'button' );
	anchor.setAttribute( 'aria-label', 'Angie' );
	document.body.appendChild( anchor );
	return anchor;
};

describe( 'AngieGuideLocation', () => {
	let anchor: HTMLElement;

	beforeEach( () => {
		mockAngieGuideCardProps.mockReset();
		anchor = createAngieAnchor();
	} );

	afterEach( () => {
		anchor.remove();
	} );

	it( 'passes onInstall to AngieGuideCard when user is admin', () => {
		// Arrange.
		mockIsAdmin( true );
		renderWithTheme( <AngieGuideLocation /> );

		// Act — open the popover.
		act( () => {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
		} );

		// Assert.
		expect( mockAngieGuideCardProps ).toHaveBeenCalledWith(
			expect.objectContaining( { onInstall: expect.any( Function ) } )
		);
	} );

	it( 'passes undefined onInstall to AngieGuideCard when user is not admin', () => {
		// Arrange.
		mockIsAdmin( false );
		renderWithTheme( <AngieGuideLocation /> );

		// Act — open the popover.
		act( () => {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
		} );

		// Assert.
		expect( mockAngieGuideCardProps ).toHaveBeenCalledWith( expect.objectContaining( { onInstall: undefined } ) );
	} );
} );

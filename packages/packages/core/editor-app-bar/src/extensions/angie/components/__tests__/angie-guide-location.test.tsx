import * as React from 'react';
import { renderWithTheme } from 'test-utils';
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

	it( 'does not pass onInstall to AngieGuideCard', () => {
		renderWithTheme( <AngieGuideLocation /> );

		act( () => {
			window.dispatchEvent( new CustomEvent( ANGIE_GUIDE_TOGGLE_EVENT ) );
		} );

		expect( mockAngieGuideCardProps ).toHaveBeenCalledWith(
			expect.not.objectContaining( { onInstall: expect.anything() } )
		);
	} );
} );

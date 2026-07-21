/* eslint-disable react/prop-types */
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock( '@elementor/ui', () => ( {
	Box: ( { children } ) => <div>{ children }</div>,
	Drawer: ( { open, children } ) => open ? <div>{ children }</div> : null,
	DirectionProvider: ( { children } ) => <div>{ children }</div>,
	ThemeProvider: ( { children } ) => <div>{ children }</div>,
} ) );

jest.mock( '@elementor/query', () => {
	const QueryClientProvider = ( { children } ) => <div>{ children }</div>;
	return {
		QueryClient: jest.fn().mockImplementation( () => ( {} ) ),
		QueryClientProvider,
	};
} );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-top-bar', () => ( {
	WhatsNewTopBar: () => <div />,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-drawer-content', () => ( {
	WhatsNewDrawerContent: ( { onSeen } ) => (
		<button data-testid="trigger-seen" onClick={ () => onSeen( 'item-1' ) }>
			Mark seen
		</button>
	),
} ) );

global.elementorCommon = { config: { isRTL: false } };
global.elementorNotifications = { unread_count: 3 };

import { WhatsNew } from 'elementor/modules/notifications/assets/js/components/whats-new';

describe( 'WhatsNew — handleSeen idempotency', () => {
	let eventSpy;

	beforeEach( () => {
		eventSpy = jest.fn();
		window.addEventListener( 'e-notification-item-seen', eventSpy );
	} );

	afterEach( () => {
		window.removeEventListener( 'e-notification-item-seen', eventSpy );
	} );

	it( 'dispatches e-notification-item-seen on first seen', () => {
		render( <WhatsNew isOpen={ true } setIsOpen={ jest.fn() } /> );

		fireEvent.click( screen.getByTestId( 'trigger-seen' ) );

		expect( eventSpy ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'does not dispatch e-notification-item-seen again for the same item id', () => {
		render( <WhatsNew isOpen={ true } setIsOpen={ jest.fn() } /> );

		const trigger = screen.getByTestId( 'trigger-seen' );
		fireEvent.click( trigger ); // First time → dispatches
		fireEvent.click( trigger ); // Same id again → should not dispatch

		expect( eventSpy ).toHaveBeenCalledTimes( 1 );
	} );
} );

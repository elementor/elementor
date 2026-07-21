/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock( '@elementor/ui', () => ( {
	Box: ( { children, role, onClick, onKeyDown, tabIndex } ) => (
		<div role={ role } onClick={ onClick } onKeyDown={ onKeyDown } tabIndex={ tabIndex }>
			{ children }
		</div>
	),
	Button: ( { children, ...props } ) => <button { ...props }>{ children }</button>,
	Collapse: ( { in: isIn, children } ) => isIn ? <div>{ children }</div> : null,
	Divider: () => <hr />,
	Link: ( { children, href } ) => <a href={ href }>{ children }</a>,
	Typography: ( { children } ) => <span>{ children }</span>,
} ) );

jest.mock( '@elementor/icons', () => ( {
	ChevronDownIcon: () => <span data-testid="chevron-icon" />,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item-media', () => ( {
	WhatsNewItemMedia: () => <div data-testid="item-media" />,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item-chips', () => ( {
	WhatsNewItemChips: () => <div data-testid="item-chips" />,
} ) );

import { WhatsNewItemCollapsed } from 'elementor/modules/notifications/assets/js/components/whats-new-item-collapsed';

const makeItem = ( overrides = {} ) => ( {
	id: 'item-1',
	title: 'New Feature',
	description: 'A short description',
	topic: 'Editor',
	link: 'https://example.com',
	readMoreText: 'Read more',
	...overrides,
} );

describe( 'WhatsNewItemCollapsed', () => {
	it( 'renders title and hides expanded content by default', () => {
		render( <WhatsNewItemCollapsed item={ makeItem() } itemIndex={ 0 } isNew={ false } /> );

		expect( screen.getByText( 'New Feature' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'item-media' ) ).not.toBeInTheDocument();
	} );

	it( 'shows expanded content after click', () => {
		render( <WhatsNewItemCollapsed item={ makeItem() } itemIndex={ 0 } isNew={ false } /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		expect( screen.getByTestId( 'item-media' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'item-chips' ) ).toBeInTheDocument();
	} );

	it( 'calls onSeen with item id on expand when isNew is true', () => {
		const onSeen = jest.fn();
		render( <WhatsNewItemCollapsed item={ makeItem() } itemIndex={ 0 } isNew={ true } onSeen={ onSeen } /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		expect( onSeen ).toHaveBeenCalledTimes( 1 );
		expect( onSeen ).toHaveBeenCalledWith( 'item-1' );
	} );

	it( 'does not call onSeen when isNew is false', () => {
		const onSeen = jest.fn();
		render( <WhatsNewItemCollapsed item={ makeItem() } itemIndex={ 0 } isNew={ false } onSeen={ onSeen } /> );

		fireEvent.click( screen.getByRole( 'button' ) );

		expect( onSeen ).not.toHaveBeenCalled();
	} );

	it( 'does not call onSeen on collapse', () => {
		const onSeen = jest.fn();
		render( <WhatsNewItemCollapsed item={ makeItem() } itemIndex={ 0 } isNew={ true } onSeen={ onSeen } /> );

		const button = screen.getByRole( 'button' );
		fireEvent.click( button ); // Expand
		fireEvent.click( button ); // Collapse

		expect( onSeen ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'expands on Enter key and calls onSeen', () => {
		const onSeen = jest.fn();
		render( <WhatsNewItemCollapsed item={ makeItem() } itemIndex={ 0 } isNew={ true } onSeen={ onSeen } /> );

		fireEvent.keyDown( screen.getByRole( 'button' ), { key: 'Enter' } );

		expect( onSeen ).toHaveBeenCalledTimes( 1 );
		expect( screen.getByTestId( 'item-media' ) ).toBeInTheDocument();
	} );
} );

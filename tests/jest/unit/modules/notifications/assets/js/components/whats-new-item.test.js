/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock( '@elementor/ui', () => ( {
	Box: ( { children } ) => <div>{ children }</div>,
	Button: ( { children } ) => <button>{ children }</button>,
	Chip: ( { label } ) => <span data-testid="chip">{ label }</span>,
	Divider: () => <hr data-testid="divider" />,
	Link: ( { children, href } ) => <a href={ href }>{ children }</a>,
	Typography: ( { children } ) => <span>{ children }</span>,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item-topic-line', () => ( {
	WhatsNewItemTopicLine: () => <div data-testid="topic-line" />,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/wrapper-with-link', () => ( {
	WrapperWithLink: ( { children } ) => <div data-testid="wrapper-link">{ children }</div>,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item-media', () => ( {
	WhatsNewItemMedia: () => <div data-testid="item-media" />,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item-chips', () => ( {
	WhatsNewItemChips: () => <div data-testid="item-chips" />,
} ) );

import { WhatsNewItem } from 'elementor/modules/notifications/assets/js/components/whats-new-item';

const makeItem = ( overrides = {} ) => ( {
	id: 'test-item',
	title: 'Default Title',
	description: 'Default description',
	imageSrc: 'https://example.com/img.png',
	link: 'https://example.com',
	...overrides,
} );

const defaultProps = {
	itemIndex: 0,
	itemsLength: 1,
	setIsOpen: jest.fn(),
};

describe( 'WhatsNewItem — image-only rendering', () => {
	it( 'renders media without title or description for image-only items', () => {
		const item = makeItem( { title: undefined, description: undefined } );

		render( <WhatsNewItem item={ item } { ...defaultProps } /> );

		expect( screen.getByTestId( 'item-media' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'topic-line' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'item-chips' ) ).not.toBeInTheDocument();
		expect( screen.queryByTestId( 'wrapper-link' ) ).not.toBeInTheDocument();
	} );

	it( 'renders full layout when item has title and description', () => {
		const item = makeItem();

		render( <WhatsNewItem item={ item } { ...defaultProps } /> );

		expect( screen.getByTestId( 'item-media' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'item-chips' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'wrapper-link' ) ).toBeInTheDocument();
	} );

	it( 'renders image-only path for gifSrc without title', () => {
		const item = makeItem( { title: undefined, description: undefined, imageSrc: undefined, gifSrc: 'https://example.com/img.gif' } );

		render( <WhatsNewItem item={ item } { ...defaultProps } /> );

		expect( screen.getByTestId( 'item-media' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'wrapper-link' ) ).not.toBeInTheDocument();
	} );
} );

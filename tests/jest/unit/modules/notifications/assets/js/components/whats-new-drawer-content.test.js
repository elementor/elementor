/* eslint-disable react/prop-types */
import '@testing-library/jest-dom';
import * as React from 'react';
import { render, screen } from '@testing-library/react';

let mockQueryReturn;

jest.mock( '@elementor/query', () => ( {
	useQuery: () => mockQueryReturn,
} ), { virtual: true } );

jest.mock( '@elementor/ui', () => ( {
	Box: ( { children } ) => <div>{ children }</div>,
	Divider: () => <hr />,
	LinearProgress: () => <div data-testid="loading" />,
	Typography: ( { children } ) => <span>{ children }</span>,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/api', () => ( {
	getNotifications: jest.fn(),
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item', () => ( {
	WhatsNewItem: ( { item } ) => <div data-testid={ `featured-${ item.id }` } />,
} ) );

jest.mock( 'elementor/modules/notifications/assets/js/components/whats-new-item-collapsed', () => ( {
	WhatsNewItemCollapsed: ( { item } ) => <div data-testid={ `collapsed-${ item.id }` } />,
} ) );

import { WhatsNewDrawerContent } from 'elementor/modules/notifications/assets/js/components/whats-new-drawer-content';

const defaultProps = {
	setIsOpen: jest.fn(),
	seenItemIds: new Set(),
	onSeen: jest.fn(),
	initialHasUnread: false,
};

describe( 'WhatsNewDrawerContent — image-only filtering', () => {
	it( 'excludes non-featured image-only items from the collapsed list', () => {
		mockQueryReturn = {
			isPending: false,
			error: null,
			data: [
				{ id: 'featured-1', featured: true, title: 'Featured', description: 'Desc', imageSrc: 'img.png' },
				{ id: 'normal-1', featured: false, title: 'Normal', description: 'Desc' },
				{ id: 'image-only-1', featured: false, imageSrc: 'img.png' },
			],
		};

		render( <WhatsNewDrawerContent { ...defaultProps } /> );

		expect( screen.getByTestId( 'featured-featured-1' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'collapsed-normal-1' ) ).toBeInTheDocument();
		expect( screen.queryByTestId( 'collapsed-image-only-1' ) ).not.toBeInTheDocument();
	} );

	it( 'renders featured image-only items in the featured section', () => {
		mockQueryReturn = {
			isPending: false,
			error: null,
			data: [
				{ id: 'image-featured-1', featured: true, imageSrc: 'img.png' },
				{ id: 'normal-1', featured: false, title: 'Normal', description: 'Desc' },
			],
		};

		render( <WhatsNewDrawerContent { ...defaultProps } /> );

		expect( screen.getByTestId( 'featured-image-featured-1' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'collapsed-normal-1' ) ).toBeInTheDocument();
	} );
} );

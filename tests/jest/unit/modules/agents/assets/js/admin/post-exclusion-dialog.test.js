import { act, fireEvent, render, screen } from '@testing-library/react';

import { listContentItems } from 'elementor/modules/agents/assets/js/admin/api';
import { PostExclusionDialog } from 'elementor/modules/agents/assets/js/admin/components/post-exclusion-dialog';
import { SEARCH_DEBOUNCE_MS } from 'elementor/modules/agents/assets/js/admin/hooks/use-markdown-items';

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	listContentItems: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( /%(\d\$)?[sd]/, arg ), format ),
} ) );

jest.mock( '@elementor/icons', () => ( {
	ExternalLinkIcon: () => <span />,
	XIcon: () => <span />,
	ZoomIcon: () => <span />,
} ) );

const MODULE = 'llms_txt';
const EXCLUDED_ID = 2;

const postType = { name: 'page', label: 'Pages', count: 3, included: true, excludedCount: 1 };

const firstPage = [
	{ id: 1, title: 'Home', url: 'https://example.com/' },
	{ id: EXCLUDED_ID, title: 'Terms', url: 'https://example.com/terms/' },
];

const secondPage = [
	{ id: 3, title: 'Pricing', url: 'https://example.com/pricing/' },
];

const renderDialog = ( props = {} ) => render(
	<PostExclusionDialog
		module={ MODULE }
		postType={ postType }
		excludedPostIds={ [ EXCLUDED_ID ] }
		onToggle={ jest.fn() }
		onClose={ jest.fn() }
		{ ...props }
	/>,
);

const flushTimers = ( ms = 0 ) => act( async () => {
	jest.advanceTimersByTime( ms );
} );

describe( 'PostExclusionDialog', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		listContentItems.mockReset();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'lists the posts with their switch state taken from the excluded ids', async () => {
		// Arrange
		listContentItems.mockResolvedValue( { items: firstPage, hasMore: false } );

		// Act
		renderDialog();
		await flushTimers();

		// Assert
		expect( listContentItems ).toHaveBeenCalledWith( { module: MODULE, postType: 'page', term: '', page: 1 } );
		expect( screen.getByRole( 'checkbox', { name: 'Home' } ).checked ).toBe( true );
		expect( screen.getByRole( 'checkbox', { name: 'Terms' } ).checked ).toBe( false );
		expect( screen.getByText( '3 published · 1 excluded' ) ).toBeTruthy();
	} );

	it( 'opens the post in a new tab from its title', async () => {
		// Arrange
		listContentItems.mockResolvedValue( { items: firstPage, hasMore: false } );

		// Act
		renderDialog();
		await flushTimers();

		// Assert
		const link = screen.getByRole( 'link', { name: 'Home' } );
		expect( link.getAttribute( 'href' ) ).toBe( 'https://example.com/' );
		expect( link.getAttribute( 'target' ) ).toBe( '_blank' );
	} );

	it( 'sends the post type and id when a switch is toggled', async () => {
		// Arrange
		const onToggle = jest.fn();
		listContentItems.mockResolvedValue( { items: firstPage, hasMore: false } );
		renderDialog( { onToggle } );
		await flushTimers();

		// Act
		fireEvent.click( screen.getByRole( 'checkbox', { name: 'Home' } ) );

		// Assert
		expect( onToggle ).toHaveBeenCalledWith( 'page', 1 );
	} );

	it( 'keeps loading pages while the list is too short to scroll', async () => {
		// Arrange
		listContentItems
			.mockResolvedValueOnce( { items: firstPage, hasMore: true } )
			.mockResolvedValueOnce( { items: secondPage, hasMore: false } );

		// Act
		renderDialog();
		await flushTimers();
		await flushTimers();

		// Assert
		expect( listContentItems ).toHaveBeenCalledTimes( 2 );
		expect( listContentItems ).toHaveBeenLastCalledWith( { module: MODULE, postType: 'page', term: '', page: 2 } );
		expect( screen.getByRole( 'checkbox', { name: 'Home' } ) ).toBeTruthy();
		expect( screen.getByRole( 'checkbox', { name: 'Pricing' } ) ).toBeTruthy();
	} );

	it( 'loads the next page only once the list is scrolled to the bottom', async () => {
		// Arrange
		const LIST_SCROLL_HEIGHT = 1000;
		const LIST_CLIENT_HEIGHT = 400;
		listContentItems
			.mockResolvedValueOnce( { items: firstPage, hasMore: true } )
			.mockResolvedValueOnce( { items: secondPage, hasMore: false } );
		renderDialog();
		const list = screen.getByTestId( 'post-exclusion-list' );
		Object.defineProperty( list, 'scrollHeight', { configurable: true, value: LIST_SCROLL_HEIGHT } );
		Object.defineProperty( list, 'clientHeight', { configurable: true, value: LIST_CLIENT_HEIGHT } );
		await flushTimers();

		// Assert
		expect( listContentItems ).toHaveBeenCalledTimes( 1 );

		// Act
		list.scrollTop = LIST_SCROLL_HEIGHT - LIST_CLIENT_HEIGHT;
		fireEvent.scroll( list );
		await flushTimers();

		// Assert
		expect( listContentItems ).toHaveBeenLastCalledWith( { module: MODULE, postType: 'page', term: '', page: 2 } );
		expect( screen.getByRole( 'checkbox', { name: 'Pricing' } ) ).toBeTruthy();
	} );

	it( 'shows an error with a retry instead of an empty-search message when loading fails', async () => {
		// Arrange
		listContentItems
			.mockRejectedValueOnce( new Error( 'network' ) )
			.mockResolvedValueOnce( { items: firstPage, hasMore: false } );

		// Act
		renderDialog();
		await flushTimers();

		// Assert
		expect( screen.getByText( 'Couldn\'t load items.' ) ).toBeTruthy();
		expect( screen.queryByText( 'Nothing matched your search.' ) ).toBeNull();

		// Act
		fireEvent.click( screen.getByRole( 'button', { name: 'Try again' } ) );
		await flushTimers();

		// Assert
		expect( screen.queryByText( 'Couldn\'t load items.' ) ).toBeNull();
		expect( screen.getByRole( 'checkbox', { name: 'Home' } ) ).toBeTruthy();
	} );

	it( 'replaces the list with the first page of results after the search debounce', async () => {
		// Arrange
		listContentItems
			.mockResolvedValueOnce( { items: firstPage, hasMore: false } )
			.mockResolvedValueOnce( { items: secondPage, hasMore: false } );
		renderDialog();
		await flushTimers();

		// Act
		fireEvent.change( screen.getByRole( 'textbox', { name: 'Search Pages' } ), { target: { value: 'pric' } } );
		await flushTimers( SEARCH_DEBOUNCE_MS );

		// Assert
		expect( listContentItems ).toHaveBeenLastCalledWith( { module: MODULE, postType: 'page', term: 'pric', page: 1 } );
		expect( screen.queryByRole( 'checkbox', { name: 'Home' } ) ).toBeNull();
		expect( screen.getByRole( 'checkbox', { name: 'Pricing' } ) ).toBeTruthy();
	} );
} );

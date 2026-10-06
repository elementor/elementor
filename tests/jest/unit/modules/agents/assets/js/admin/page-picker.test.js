import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { searchMarkdownItems } from 'elementor/modules/agents/assets/js/admin/api';
import { getIncludedTypesKey } from 'elementor/modules/agents/assets/js/admin/components/markdown-content/markdown-items';
import { PagePicker } from 'elementor/modules/agents/assets/js/admin/components/markdown-content/page-picker';
import { SEARCH_DEBOUNCE_MS } from 'elementor/modules/agents/assets/js/admin/hooks/use-markdown-items';

jest.mock( 'elementor/modules/agents/assets/js/admin/api', () => ( {
	searchMarkdownItems: jest.fn(),
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( text ) => text,
	sprintf: ( format, ...args ) => args.reduce( ( text, arg ) => text.replace( '%s', arg ), format ),
} ) );

jest.mock( '@elementor/icons', () => ( {
	FileIcon: () => <span />,
} ) );

const items = [
	{ id: 1, title: 'Home page', path: '/home', type: 'page' },
	{ id: 2, title: 'Blog', path: '/blog', type: 'post' },
];

const getPickerInput = () => screen.getByRole( 'combobox', { name: 'Select a page' } );

const openPicker = () => fireEvent.keyDown( getPickerInput(), { key: 'ArrowDown' } );

const typeQuery = async ( value ) => {
	fireEvent.change( getPickerInput(), { target: { value } } );

	await act( async () => {
		jest.advanceTimersByTime( SEARCH_DEBOUNCE_MS );
	} );
};

const ControlledPicker = () => {
	const [ selectedItem, setSelectedItem ] = useState( items[ 0 ] );

	return <PagePicker items={ items } selectedItem={ selectedItem } onSelect={ setSelectedItem } />;
};

describe( 'markdown page picker', () => {
	beforeEach( () => {
		jest.useFakeTimers();
		searchMarkdownItems.mockReset();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'builds the refresh key from the included post types only', () => {
		// Arrange
		const postTypes = [
			{ name: 'page', included: true },
			{ name: 'post', included: false },
			{ name: 'product', included: true },
		];

		// Act
		const key = getIncludedTypesKey( postTypes );

		// Assert
		expect( key ).toBe( 'page,product' );
	} );

	it( 'lists the default items without searching while the query is empty', () => {
		// Arrange
		render( <PagePicker items={ items } selectedItem={ items[ 0 ] } onSelect={ jest.fn() } /> );

		// Act
		openPicker();

		// Assert
		expect( screen.getByRole( 'option', { name: 'Blog' } ) ).toBeTruthy();
		expect( searchMarkdownItems ).not.toHaveBeenCalled();
	} );

	it( 'searches the server after the debounce and selects a result', async () => {
		// Arrange
		const pricing = { id: 3, title: 'Pricing', path: '/pricing', type: 'page' };
		const onSelect = jest.fn();
		searchMarkdownItems.mockResolvedValue( [ pricing ] );
		render( <PagePicker items={ items } selectedItem={ items[ 0 ] } onSelect={ onSelect } /> );
		openPicker();

		// Act
		await typeQuery( 'pric' );
		fireEvent.click( screen.getByRole( 'option', { name: 'Pricing' } ) );

		// Assert
		expect( searchMarkdownItems ).toHaveBeenCalledTimes( 1 );
		expect( searchMarkdownItems ).toHaveBeenCalledWith( 'pric' );
		expect( onSelect ).toHaveBeenCalledWith( pricing );
	} );

	it( 'shows the empty state when the search returns nothing', async () => {
		// Arrange
		searchMarkdownItems.mockResolvedValue( [] );
		render( <PagePicker items={ items } selectedItem={ items[ 0 ] } onSelect={ jest.fn() } /> );
		openPicker();

		// Act
		await typeQuery( 'checkout' );

		// Assert
		expect( screen.getByText( /Sorry, nothing matched/ ) ).toBeTruthy();
		expect( screen.getByText( /“checkout“\./ ) ).toBeTruthy();
		expect( screen.queryByRole( 'option', { name: 'Blog' } ) ).toBeNull();
	} );

	it( 'does not search for the selected title when reopening after a selection', async () => {
		// Arrange
		render( <ControlledPicker /> );
		openPicker();
		fireEvent.click( screen.getByRole( 'option', { name: 'Blog' } ) );

		// Act
		openPicker();
		await act( async () => {
			jest.advanceTimersByTime( SEARCH_DEBOUNCE_MS );
		} );

		// Assert
		expect( getPickerInput().value ).toBe( 'Blog' );
		expect( screen.getByRole( 'option', { name: 'Home page' } ) ).toBeTruthy();
		expect( searchMarkdownItems ).not.toHaveBeenCalled();
	} );
} );

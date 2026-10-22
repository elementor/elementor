import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { type FontAwesome7Icon } from '../icon-library/font-awesome-7-catalog';
import { useIconLibraryProviderIcons, useProviderIconSvg } from '../icon-library/icon-library-providers';
import { useFontAwesome7Catalog } from '../icon-library/use-font-awesome-7-catalog';
import { SvgMediaPreview } from '../svg-media-preview';

jest.mock( '../icon-library/use-font-awesome-7-catalog' );
jest.mock( '../icon-library/icon-library-providers' );
jest.mock( '../icon-library/font-awesome-glyph', () => ( {
	FontAwesomeGlyph: ( { icon }: { icon: FontAwesome7Icon } ) => (
		<span
			role="img"
			aria-label="glyph"
			data-lazy={ String( Boolean( icon.lazySvg ) ) }
			data-markup={ icon.svgMarkup ?? '' }
		>
			{ icon.id }
		</span>
	),
} ) );

const freeStar: FontAwesome7Icon = {
	id: 'fa-solid:star',
	name: 'star',
	label: 'star',
	library: 'fa-solid',
	value: 'fa-solid fa-star',
	aliases: [],
	width: 512,
	height: 512,
	paths: [ 'M0 0' ],
};

const renderPreview = ( iconLibrary: string | null, iconClassName: string | null ) =>
	render(
		<SvgMediaPreview
			isFetching={ false }
			src={ null }
			iconClassName={ iconClassName }
			iconLibrary={ iconLibrary }
		/>
	);

describe( 'SvgMediaPreview', () => {
	beforeEach( () => {
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( { data: [ freeStar ], isLoading: false } as never );
		jest.mocked( useIconLibraryProviderIcons ).mockReturnValue( { data: [], isLoading: false } );
		jest.mocked( useProviderIconSvg ).mockReturnValue( { data: null, isLoading: false } as never );
	} );

	it( 'renders a free icon from the catalog', () => {
		// Act.
		renderPreview( 'fa-solid', 'fa-solid fa-star' );

		// Assert.
		expect( screen.getByRole( 'img', { name: 'glyph' } ) ).toHaveTextContent( 'fa-solid:star' );
	} );

	it( 'renders a lazy glyph for a Font Awesome icon missing from the catalog', () => {
		// Act.
		renderPreview( 'fa-light', 'fa-light fa-bolt' );

		// Assert.
		expect( screen.getByRole( 'img', { name: 'glyph' } ) ).toHaveAttribute( 'data-lazy', 'true' );
	} );

	it( 'does not load provider catalogs for a Font Awesome library', () => {
		// Act.
		renderPreview( 'fa-light', 'fa-light fa-bolt' );

		// Assert.
		expect( useIconLibraryProviderIcons ).toHaveBeenCalledWith( false );
	} );

	it( 'does not wait for a loading provider when the icon is a Font Awesome icon', () => {
		// Arrange.
		jest.mocked( useIconLibraryProviderIcons ).mockReturnValue( { data: [], isLoading: true } );

		// Act.
		renderPreview( 'fa-light', 'fa-light fa-bolt' );

		// Assert.
		expect( screen.queryByRole( 'progressbar' ) ).not.toBeInTheDocument();
		expect( screen.getByRole( 'img', { name: 'glyph' } ) ).toBeInTheDocument();
	} );

	it( 'loads provider catalogs for a custom library', () => {
		// Act.
		renderPreview( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( useIconLibraryProviderIcons ).toHaveBeenCalledWith( true );
	} );

	it( 'renders the saved markup of a custom icon missing from the catalogs', () => {
		// Arrange.
		jest.mocked( useProviderIconSvg ).mockReturnValue( {
			data: '<svg id="saved"></svg>',
			isLoading: false,
		} as never );

		// Act.
		renderPreview( 'my-icons', 'my-icons badge' );

		// Assert.
		expect( screen.getByRole( 'img', { name: 'glyph' } ) ).toHaveAttribute(
			'data-markup',
			'<svg id="saved"></svg>'
		);
	} );

	it( 'never looks up saved markup for a Font Awesome icon', () => {
		// Act.
		renderPreview( 'fa-light', 'fa-light fa-bolt' );

		// Assert.
		expect( jest.mocked( useProviderIconSvg ).mock.calls.every( ( call ) => call[ 2 ] === false ) ).toBe( true );
	} );

	it( 'shows a named loading state while the free catalog loads', () => {
		// Arrange.
		jest.mocked( useFontAwesome7Catalog ).mockReturnValue( { data: [], isLoading: true } as never );

		// Act.
		renderPreview( 'fa-solid', 'fa-solid fa-star' );

		// Assert.
		expect( screen.getByRole( 'progressbar', { name: 'Loading icon' } ) ).toBeInTheDocument();
	} );

	it( 'falls back to the placeholder for a custom icon that cannot be resolved', () => {
		// Act.
		renderPreview( 'my-icons', 'my-icons gone' );

		// Assert.
		expect( screen.queryByRole( 'img', { name: 'glyph' } ) ).not.toBeInTheDocument();
	} );
} );

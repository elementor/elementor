import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

import { type FontAwesome7Icon } from '../font-awesome-7-catalog';
import { FontAwesomeGlyph } from '../font-awesome-glyph';
import { resolveProviderIconPreviewSvg } from '../icon-library-providers';

jest.mock( '../icon-library-providers', () => ( {
	resolveProviderIconPreviewSvg: jest.fn(),
} ) );

const lazyIcon: FontAwesome7Icon = {
	id: 'fa-light:star',
	name: 'star',
	label: 'star',
	library: 'fa-light',
	value: 'fa-light fa-star',
	aliases: [],
	width: 512,
	height: 512,
	paths: [],
	lazySvg: true,
};

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1h8v8H1z"></path></svg>';

describe( 'FontAwesomeGlyph lazy svg', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders the resolved markup for a lazy icon', async () => {
		// Arrange.
		jest.mocked( resolveProviderIconPreviewSvg ).mockResolvedValue( SVG );

		// Act.
		render( <FontAwesomeGlyph icon={ lazyIcon } size={ 24 } color="red" label="Star" /> );

		// Assert.
		expect( await screen.findByRole( 'img', { name: 'Star' } ) ).toBeInTheDocument();
		expect( resolveProviderIconPreviewSvg ).toHaveBeenCalledWith(
			'fa-light',
			'fa-light fa-star',
			expect.any( AbortSignal )
		);
	} );

	it( 'renders nothing while the markup is unresolved', () => {
		// Arrange.
		jest.mocked( resolveProviderIconPreviewSvg ).mockReturnValue( new Promise( () => {} ) );

		// Act.
		const { container } = render( <FontAwesomeGlyph icon={ lazyIcon } size={ 24 } color="red" /> );

		// Assert.
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'renders nothing when the provider cannot resolve the icon', async () => {
		// Arrange.
		jest.mocked( resolveProviderIconPreviewSvg ).mockResolvedValue( null );

		// Act.
		const { container } = render( <FontAwesomeGlyph icon={ lazyIcon } size={ 24 } color="red" /> );

		// Assert.
		await waitFor( () => expect( resolveProviderIconPreviewSvg ).toHaveBeenCalled() );
		expect( container ).toBeEmptyDOMElement();
	} );

	it( 'does not ask providers when the icon already has markup', () => {
		// Arrange.
		const icon = { ...lazyIcon, svgMarkup: SVG };

		// Act.
		render( <FontAwesomeGlyph icon={ icon } size={ 24 } color="red" /> );

		// Assert.
		expect( resolveProviderIconPreviewSvg ).not.toHaveBeenCalled();
	} );
} );

import * as React from 'react';
import { render, screen } from '@testing-library/react';

import PageTitleAndStatus from '../page-title-and-status';

jest.mock( '../../../hooks/use-reverse-html-entities', () => ( {
	useReverseHtmlEntities: ( title: string ) => title,
} ) );

describe( 'PageTitleAndStatus', () => {
	it( 'renders title only for published content', () => {
		render( <PageTitleAndStatus status="publish" title="Home" /> );

		expect( screen.getByText( 'Home' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Draft' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a status badge for draft content', () => {
		render( <PageTitleAndStatus status="draft" title="About" /> );

		expect( screen.getByText( 'About' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Draft' ) ).toBeInTheDocument();
		expect( screen.queryByText( '(draft)' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a pending status badge label', () => {
		render( <PageTitleAndStatus status="pending" title="Review me" /> );

		expect( screen.getByText( 'Pending Review' ) ).toBeInTheDocument();
	} );

	it( 'uses custom status text for unknown plugin statuses', () => {
		render( <PageTitleAndStatus status="custom-plugin-status" title="Plugin post" /> );

		expect( screen.getByText( 'custom-plugin-status' ) ).toBeInTheDocument();
	} );
} );

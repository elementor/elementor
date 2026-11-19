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
		expect( screen.queryByTestId( 'post-status-badge' ) ).not.toBeInTheDocument();
	} );

	it( 'renders a status badge for draft content', () => {
		render( <PageTitleAndStatus status="draft" title="About" /> );

		expect( screen.getByText( 'About' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Draft' ) ).toBeInTheDocument();
		expect( screen.queryByText( '(draft)' ) ).not.toBeInTheDocument();
		expect( screen.getByTestId( 'post-status-badge' ) ).toHaveAttribute( 'data-status-tone', 'neutral' );
	} );

	it( 'renders a pending status badge with warning color', () => {
		render( <PageTitleAndStatus status="pending" title="Review me" /> );

		expect( screen.getByText( 'Pending Review' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'post-status-badge' ) ).toHaveAttribute( 'data-status-tone', 'waiting' );
	} );

	it( 'uses neutral badge for unknown custom statuses', () => {
		render( <PageTitleAndStatus status="custom-plugin-status" title="Plugin post" /> );

		expect( screen.getByText( 'custom-plugin-status' ) ).toBeInTheDocument();
		expect( screen.getByTestId( 'post-status-badge' ) ).toHaveAttribute( 'data-status-tone', 'neutral' );
	} );
} );
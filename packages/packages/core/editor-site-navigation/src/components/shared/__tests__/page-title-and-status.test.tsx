import * as React from 'react';
import { render, screen } from '@testing-library/react';

import PageTitleAndStatus, { getStatusChipConfig } from '../page-title-and-status';

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

	it( 'renders scheduled and private status badge labels', () => {
		render( <PageTitleAndStatus status="future" title="Launch day" /> );
		expect( screen.getByText( 'Scheduled' ) ).toBeInTheDocument();

		render( <PageTitleAndStatus status="private" title="Members only" /> );
		expect( screen.getByText( 'Private' ) ).toBeInTheDocument();
	} );

	it( 'humanizes unknown plugin statuses in the badge label', () => {
		render( <PageTitleAndStatus status="in-progress" title="Plugin post" /> );

		expect( screen.getByText( 'in progress' ) ).toBeInTheDocument();
	} );

	it( 'maps known statuses to chip config labels', () => {
		expect( getStatusChipConfig( 'draft' ).label ).toBe( 'Draft' );
		expect( getStatusChipConfig( 'in-progress' ).label ).toBe( 'in progress' );
	} );
} );

import * as React from 'react';
import { render, screen } from '@testing-library/react';

import { getSiteContentSections, registerSiteContentSection, resetSiteContentSections } from '../site-content-sections';

describe( 'site-content-sections', () => {
	afterEach( () => {
		resetSiteContentSections();
	} );

	it( 'returns registered sections sorted by priority', () => {
		registerSiteContentSection( {
			id: 'b',
			priority: 10,
			render: () => <span>B section</span>,
		} );
		registerSiteContentSection( {
			id: 'a',
			priority: 0,
			render: () => <span>A section</span>,
		} );

		const sections = getSiteContentSections();

		expect( sections.map( ( section ) => section.id ) ).toEqual( [ 'a', 'b' ] );
	} );

	it( 'replaces a section when re-registering the same id', () => {
		registerSiteContentSection( {
			id: 'popups',
			render: () => <span>First</span>,
		} );
		registerSiteContentSection( {
			id: 'popups',
			render: () => <span>Second</span>,
		} );

		render( <>{ getSiteContentSections()[ 0 ].render() }</> );

		expect( screen.getByText( 'Second' ) ).toBeInTheDocument();
	} );
} );

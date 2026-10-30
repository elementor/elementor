import { fireEvent, render, screen } from '@testing-library/react';

import { PassingTable } from 'elementor/modules/agents/assets/js/admin/scanner/components/passing-table';
import { STAGE_REACH } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';

const getCheck = ( overrides = {} ) => ( {
	id: 'sitemap',
	title: 'Sitemap exists',
	stage: STAGE_REACH,
	description: 'Sitemaps help agents.',
	evidence: 'Found sitemap.xml',
	points: 2,
	...overrides,
} );

const expandRow = () => fireEvent.click( screen.getByRole( 'button', { name: /Sitemap exists/ } ) );

describe( 'PassingTable', () => {
	it( 'shows what it means and what we found when a passed row is expanded', () => {
		// Arrange
		render( <PassingTable checks={ [ getCheck() ] } /> );

		// Act
		expandRow();

		// Assert
		expect( screen.getByText( 'What it means' ) ).toBeTruthy();
		expect( screen.getByText( 'Sitemaps help agents.' ) ).toBeTruthy();
		expect( screen.getByText( 'What we found' ) ).toBeTruthy();
		expect( screen.getByText( 'Found sitemap.xml' ) ).toBeTruthy();
	} );

	it( 'hides what we found when the evidence is empty', () => {
		// Arrange
		render( <PassingTable checks={ [ getCheck( { evidence: '' } ) ] } /> );

		// Act
		expandRow();

		// Assert
		expect( screen.getByText( 'What it means' ) ).toBeTruthy();
		expect( screen.queryByText( 'What we found' ) ).toBeNull();
	} );
} );

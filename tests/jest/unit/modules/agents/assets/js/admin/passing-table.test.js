import { fireEvent, render, screen } from '@testing-library/react';

import { PassingTable } from 'elementor/modules/agents/assets/js/admin/scanner/components/passing-table';
import { SCAN_SOURCE_URL, STAGE_REACH } from 'elementor/modules/agents/assets/js/admin/scanner/scanner-constants';

const expectOraAttribution = () => {
	expect( screen.getByText( 'Powered by' ) ).toBeTruthy();
	expect( screen.getByRole( 'link', { name: 'Ora' } ).getAttribute( 'href' ) ).toBe( SCAN_SOURCE_URL );
};

const getCheck = ( overrides = {} ) => ( {
	id: 'sitemap',
	title: 'Sitemap exists',
	stage: STAGE_REACH,
	description: 'Sitemaps help agents.',
	evidence: 'Found sitemap.xml',
	points: 2,
	...overrides,
} );

const expandCard = () => fireEvent.click( screen.getByRole( 'button', { name: 'Show passed checks' } ) );

const expandRow = () => {
	expandCard();
	fireEvent.click( screen.getByRole( 'button', { name: /Sitemap exists/ } ) );
};

describe( 'PassingTable', () => {
	it( 'keeps the passed checks collapsed behind a count until the card is opened', () => {
		// Arrange
		render( <PassingTable checks={ [ getCheck() ] } /> );

		// Assert
		expect( screen.getByText( '1 Check passed' ) ).toBeTruthy();
		expect( screen.queryByText( 'Sitemap exists' ) ).toBeNull();

		// Act
		expandCard();

		// Assert
		expect( screen.getByText( 'Sitemap exists' ) ).toBeTruthy();
	} );

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

	it( 'shows Ora attribution when there are no passed checks', () => {
		// Arrange
		render( <PassingTable checks={ [] } /> );

		// Assert
		expectOraAttribution();
	} );

	it( 'shows Ora attribution below the passed checks table', () => {
		// Arrange
		render( <PassingTable checks={ [ getCheck() ] } /> );

		// Assert
		expectOraAttribution();
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

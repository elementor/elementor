import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { useFloatingPanelZIndex } from '@elementor/editor-floating-panels';
import { fireEvent, screen } from '@testing-library/react';

import { AUDIT_PANEL_ID } from '../../constants';
import RescanButton from '../rescan-button';

jest.mock( '@elementor/editor-floating-panels', () => ( {
	useFloatingPanelZIndex: jest.fn( () => 1000 ),
} ) );

describe( 'RescanButton', () => {
	it( 'reads the audit panel z-index so the tooltip renders above the floating panel', () => {
		// Act.
		renderWithTheme( <RescanButton hasScanned isStale disabled={ false } onClick={ jest.fn() } /> );

		// Assert.
		expect( useFloatingPanelZIndex ).toHaveBeenCalledWith( AUDIT_PANEL_ID );
	} );

	it( 'shows the stale badge and tooltip when the report is out of date', async () => {
		// Act.
		renderWithTheme( <RescanButton hasScanned isStale disabled={ false } onClick={ jest.fn() } /> );

		// Assert.
		expect( screen.getByText( 'Rescan' ) ).toBeInTheDocument();

		fireEvent.mouseOver( screen.getByRole( 'button', { name: 'Rescan' } ) );

		expect( await screen.findByRole( 'tooltip' ) ).toHaveTextContent( 'Page content changed - rescan advised' );
	} );

	it( 'hides the stale badge and tooltip when the report is up to date', () => {
		// Act.
		renderWithTheme( <RescanButton hasScanned isStale={ false } disabled={ false } onClick={ jest.fn() } /> );

		// Assert.
		fireEvent.mouseOver( screen.getByRole( 'button', { name: 'Rescan' } ) );

		expect( screen.queryByRole( 'tooltip' ) ).not.toBeInTheDocument();
	} );

	it( 'shows the initial scan label when the page has not been scanned yet', () => {
		// Act.
		renderWithTheme(
			<RescanButton hasScanned={ false } isStale={ false } disabled={ false } onClick={ jest.fn() } />
		);

		// Assert.
		expect( screen.getByText( 'Run page audit' ) ).toBeInTheDocument();
	} );

	it( 'calls onClick when clicked', () => {
		// Arrange.
		const onClick = jest.fn();
		renderWithTheme( <RescanButton hasScanned isStale={ false } disabled={ false } onClick={ onClick } /> );

		// Act.
		fireEvent.click( screen.getByRole( 'button', { name: 'Rescan' } ) );

		// Assert.
		expect( onClick ).toHaveBeenCalledTimes( 1 );
	} );
} );

import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { type AuditViolation } from '../../types';
import ViolationIcon from '../violation-icons';

jest.mock( '@elementor/icons', () => ( {
	...jest.requireActual( '@elementor/icons' ),
	FileSettingsIcon: jest.fn( () => <svg role="img" aria-label="File settings icon" /> ),
	SettingsIcon: jest.fn( () => <svg role="img" aria-label="Settings icon" /> ),
} ) );

function renderIcon( violation: AuditViolation, widgetIcon: string | null = null ) {
	return renderWithTheme( <ViolationIcon violation={ violation } widgetIcon={ widgetIcon } /> );
}

describe( 'ViolationIcon', () => {
	it( 'renders the widget icon when provided', () => {
		// Arrange & Act.
		const { container } = renderIcon( { auditId: 'audits/x', elementId: 'el-1', label: 'Issue' }, 'eicon-image' );

		// Assert.
		// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- the widget icon is a decorative, aria-hidden <i> with no accessible role.
		expect( container.querySelector( '.eicon-image' ) ).toBeInTheDocument();
	} );

	it( 'falls back to a generic settings icon when there is no widget icon or targetHint', () => {
		// Arrange & Act.
		renderIcon( { auditId: 'audits/x', label: 'Issue' } );

		// Assert.
		expect( screen.getByRole( 'img', { name: 'Settings icon' } ) ).toBeInTheDocument();
	} );

	it( 'falls back to a generic settings icon for site-level targetHints', () => {
		// Arrange & Act.
		renderIcon( { auditId: 'audits/x', label: 'Issue', targetHint: 'site-identity-settings' } );

		// Assert.
		expect( screen.getByRole( 'img', { name: 'Settings icon' } ) ).toBeInTheDocument();
	} );

	it( 'renders a file settings icon for page-settings targetHint', () => {
		// Arrange & Act.
		renderIcon( { auditId: 'audits/x', label: 'Issue', targetHint: 'page-settings' } );

		// Assert.
		expect( screen.getByRole( 'img', { name: 'File settings icon' } ) ).toBeInTheDocument();
	} );
} );

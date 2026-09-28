import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { fireEvent, screen } from '@testing-library/react';

import { type AuditMeta, type AuditViolation } from '../../types';
import ViolationRow from '../violation-row';

const AUDIT: AuditMeta = {
	id: 'audits/page-title',
	title: 'Page title',
	description: 'Pages need a clear title for SEO and screen-reader navigation.',
	fixHint: 'Open Page Settings and add a title.',
	categories: [ 'seo' ],
	severity: 'error',
	weight: 10,
};

function renderViolation( violation: AuditViolation ) {
	renderWithTheme( <ViolationRow audit={ AUDIT } violations={ [ violation ] } /> );

	fireEvent.click( screen.getByText( AUDIT.title ) );
}

describe( 'ViolationRow', () => {
	it( 'uses the violation angiePrompt as the Fix with Angie prompt when provided', () => {
		const violation: AuditViolation = {
			auditId: AUDIT.id,
			label: 'Page has no title.',
			angieFix: true,
			angiePrompt: "Based on this page's contents, generate a title for this page.",
		};

		renderViolation( violation );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );

		expect( link ).toHaveAttribute(
			'href',
			`#angie-prompt=${ encodeURIComponent( violation.angiePrompt as string ) }`
		);
	} );

	it( 'falls back to the generic Help me fix prompt when angiePrompt is not provided', () => {
		const violation: AuditViolation = {
			auditId: AUDIT.id,
			label: 'Site description is missing or still uses the default.',
			angieFix: true,
		};

		renderViolation( violation );

		const link = screen.getByRole( 'link', { name: 'Fix with Angie' } );
		const expectedPrompt = `Help me fix: ${ violation.label }`;

		expect( link ).toHaveAttribute( 'href', `#angie-prompt=${ encodeURIComponent( expectedPrompt ) }` );
	} );
} );

import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { useFloatingPanelZIndex } from '@elementor/editor-floating-panels';
import { fireEvent, screen } from '@testing-library/react';

import { AUDIT_PANEL_ID } from '../../constants';
import { focusViolation } from '../../hooks/focus-violation';
import { type AuditMeta, type AuditViolation } from '../../types';
import ViolationRow from '../violation-row';

jest.mock( '../../hooks/focus-violation', () => ( {
	focusViolation: jest.fn(),
} ) );

jest.mock( '@elementor/editor-elements', () => ( {
	getElementIcon: jest.fn( () => null ),
	getElementTitle: jest.fn( () => null ),
} ) );

jest.mock( '@elementor/editor-floating-panels', () => ( {
	useFloatingPanelZIndex: jest.fn( () => 1000 ),
} ) );

const AUDIT: AuditMeta = {
	id: 'audits/page-title',
	title: 'Page title',
	description: 'Pages need a clear title for SEO and screen-reader navigation.',
	fixHint: 'Open Page Settings and add a title.',
	categories: [ 'seo' ],
	severity: 'error',
	weight: 10,
};

function renderExpanded( violations?: AuditViolation[] ) {
	renderWithTheme( <ViolationRow audit={ AUDIT } violations={ violations } expanded onToggleExpand={ jest.fn() } /> );
}

describe( 'ViolationRow', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'calls onToggleExpand when the header is clicked', () => {
		// Arrange.
		const onToggleExpand = jest.fn();
		renderWithTheme(
			<ViolationRow
				audit={ AUDIT }
				violations={ [ { auditId: AUDIT.id, label: 'Page has no title.' } ] }
				expanded={ false }
				onToggleExpand={ onToggleExpand }
			/>
		);

		// Act.
		fireEvent.click( screen.getByText( AUDIT.title ) );

		// Assert.
		expect( onToggleExpand ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'uses the violation angiePrompt as the Fix with Angie prompt when provided', () => {
		// Arrange.
		const angiePrompt = "Based on this page's contents, generate a title for this page.";

		// Act.
		renderExpanded( [ { auditId: AUDIT.id, label: 'Page has no title.', angieFix: true, angiePrompt } ] );

		// Assert.
		const fixWithAngieLink = screen.getByRole( 'link', { name: 'Fix with Angie' } );
		expect( fixWithAngieLink ).toHaveAttribute( 'href', `#angie-prompt=${ encodeURIComponent( angiePrompt ) }` );
	} );

	it( 'falls back to the generic Help me fix prompt when angiePrompt is not provided', () => {
		// Arrange & Act.
		renderExpanded( [
			{ auditId: AUDIT.id, label: 'Site description is missing or still uses the default.', angieFix: true },
		] );

		// Assert.
		const fixWithAngieLink = screen.getByRole( 'link', { name: 'Fix with Angie' } );
		expect( fixWithAngieLink ).toHaveAttribute(
			'href',
			`#angie-prompt=${ encodeURIComponent(
				'Help me fix: Site description is missing or still uses the default.'
			) }`
		);
	} );

	it( 'reads the audit panel z-index so the Fix with Angie tooltip renders above the floating panel', () => {
		// Arrange & Act.
		renderExpanded( [ { auditId: AUDIT.id, label: 'Page has no title.', angieFix: true } ] );

		// Assert.
		expect( useFloatingPanelZIndex ).toHaveBeenCalledWith( AUDIT_PANEL_ID );
	} );

	it( 'renders Fix with Angie only on the affected item row, not inside the guidance box', () => {
		// Arrange & Act.
		renderExpanded( [
			{ auditId: AUDIT.id, label: 'Page has no title.', angieFix: true },
			{ auditId: AUDIT.id, label: 'Page title is a duplicate.', angieFix: true },
		] );

		// Assert.
		expect( screen.getAllByRole( 'link', { name: 'Fix with Angie' } ) ).toHaveLength( 2 );
	} );

	it( 'renders both the primary and secondary CTA buttons inside the guidance box when provided', () => {
		// Arrange & Act.
		renderExpanded( [
			{
				auditId: AUDIT.id,
				label: 'No accessibility statement has been created for this site.',
				externalUrl:
					'https://example.com/wp-admin/admin.php?page=accessibility-settings#accessibilityStatement',
				ctaLabel: 'Create',
				secondaryCtaLabel: 'Learn more',
				secondaryCtaUrl: 'https://go.elementor.com/acc-plg-learn-more',
			},
		] );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeInTheDocument();
		expect( screen.getByRole( 'button', { name: 'Learn more' } ) ).toBeInTheDocument();
	} );

	it( 'does not render a secondary CTA button when only the primary CTA is provided', () => {
		// Arrange & Act.
		renderExpanded( [
			{
				auditId: AUDIT.id,
				label: 'No privacy policy page is set.',
				externalUrl: 'https://example.com/wp-admin/options-privacy.php',
				ctaLabel: 'Create',
			},
		] );

		// Assert.
		expect( screen.getByRole( 'button', { name: 'Create' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'button', { name: 'Learn more' } ) ).not.toBeInTheDocument();
	} );

	it( 'renders the affected items list for any non-empty violations, regardless of elementId', () => {
		// Arrange & Act.
		renderExpanded( [ { auditId: AUDIT.id, label: 'No privacy policy page is set.' } ] );

		// Assert.
		expect( screen.getByRole( 'list' ) ).toBeInTheDocument();
	} );

	it( 'navigates via focusViolation when the guidance box is clicked and no CTA exists', () => {
		// Arrange.
		renderExpanded( [
			{ auditId: AUDIT.id, label: 'Site logo is not set.', targetHint: 'site-identity-settings' },
		] );

		// Act.
		fireEvent.click( screen.getByText( 'Pages need a clear title for SEO and screen-reader navigation.' ) );

		// Assert.
		expect( focusViolation ).toHaveBeenCalledWith( expect.objectContaining( { label: 'Site logo is not set.' } ) );
	} );

	describe( 'violations with an elementId', () => {
		const PAGE_LEVEL_VIOLATIONS: AuditViolation[] = [
			{ auditId: AUDIT.id, elementId: 'el-1', label: 'Image is missing alt text.' },
			{ auditId: AUDIT.id, elementId: 'el-2', label: 'Image is missing alt text.' },
		];

		it( 'renders the affected items list', () => {
			// Arrange & Act.
			renderExpanded( PAGE_LEVEL_VIOLATIONS );

			// Assert.
			expect( screen.getByRole( 'list' ) ).toBeInTheDocument();
			expect( screen.getAllByText( 'Image is missing alt text.' ) ).toHaveLength( 2 );
		} );

		it( 'navigates via focusViolation when the guidance box is clicked and the first violation has no CTA', () => {
			// Arrange & Act.
			renderExpanded( PAGE_LEVEL_VIOLATIONS );

			// Act.
			fireEvent.click( screen.getByText( 'Pages need a clear title for SEO and screen-reader navigation.' ) );

			// Assert.
			expect( focusViolation ).toHaveBeenCalledWith( PAGE_LEVEL_VIOLATIONS[ 0 ] );
		} );

		it( 'still shows the embedded CTA in the guidance box when the first violation has one', () => {
			// Arrange & Act.
			renderExpanded( [
				{
					auditId: AUDIT.id,
					elementId: 'el-1',
					label: 'Image is 900 KB (over 500 KB).',
					externalUrl: 'https://example.com/optimize',
					ctaLabel: 'Optimize all',
				},
			] );

			// Assert.
			expect( screen.getByRole( 'button', { name: 'Optimize all' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'list' ) ).toBeInTheDocument();
		} );

		it( 'navigates via focusViolation when an affected item row is clicked', () => {
			// Arrange.
			renderExpanded( PAGE_LEVEL_VIOLATIONS );

			// Act.
			fireEvent.click( screen.getAllByText( 'Image is missing alt text.' )[ 0 ] );

			// Assert.
			expect( focusViolation ).toHaveBeenCalledWith( PAGE_LEVEL_VIOLATIONS[ 0 ] );
		} );
	} );

	describe( 'passed audits', () => {
		it( 'shows the guidance box without an embedded action or affected items list', () => {
			// Arrange & Act.
			renderExpanded( undefined );

			// Assert.
			expect(
				screen.getByText( 'Pages need a clear title for SEO and screen-reader navigation.' )
			).toBeInTheDocument();
			expect( screen.queryByRole( 'button', { name: /optimize|create|fix/i } ) ).not.toBeInTheDocument();
			expect( screen.queryByRole( 'list' ) ).not.toBeInTheDocument();
		} );
	} );
} );

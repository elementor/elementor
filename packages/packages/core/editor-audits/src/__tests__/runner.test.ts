import { getHostDocumentElements, getHostDocumentId } from '@elementor/editor-elements';

import { fetchPageContext } from '../api/page-context-client';
import { clearAuditRegistry, registerAudit } from '../registry';
import { runPageAudit } from '../runner';
import { type Audit, type AuditResult, type PageContextResponse } from '../types';

jest.mock( '../api/page-context-client' );

jest.mock( '@elementor/editor-elements', () => ( {
	getHostDocumentElements: jest.fn(),
	getHostDocumentId: jest.fn( () => 1 ),
} ) );

const fetchMock = jest.mocked( fetchPageContext );
const getHostDocumentElementsMock = jest.mocked( getHostDocumentElements );
const getHostDocumentIdMock = jest.mocked( getHostDocumentId );

const FAKE_PAGE_CONTEXT: PageContextResponse = {
	post_title: 'X',
	post_excerpt: null,
	featured_image_id: null,
	image_sizes: {},
	kit_id: 0,
	kit_is_default_unchanged: false,
	is_noindex: false,
	reading_settings_url: 'https://example.com/wp-admin/options-reading.php',
	privacy_policy_url: null,
	privacy_settings_url: 'https://example.com/wp-admin/options-privacy.php',
	ally_plugin_active: false,
	ally_plugin_url: 'https://example.com/wp-admin/plugin-install.php',
	ally_accessibility_statement_created: false,
	ally_accessibility_statement_url:
		'https://example.com/wp-admin/admin.php?page=accessibility-settings#accessibilityStatement',
	ally_widget_settings_url: 'https://example.com/wp-admin/admin.php?page=accessibility-settings#capabilities',
	ally_scan_url: 'https://example.com/wp-admin/admin.php?page=accessibility-settings#scans',
	cookiez_plugin_active: false,
	cookiez_plugin_url: 'https://example.com/wp-admin/plugin-install.php',
	cookiez_plugin_installed: false,
	cookiez_plugin_action_url: 'https://example.com/wp-admin/plugin-install.php',
	cookiez_scan_url: 'https://example.com/wp-admin/admin.php?page=cookiez-settings#cookie-management',
	cookiez_consent_mode_settings_url: 'https://example.com/wp-admin/admin.php?page=cookiez-settings#settings',
	image_optimization_plugin_active: false,
	image_optimization_plugin_url: 'https://example.com/wp-admin/plugin-install.php',
	image_optimization_settings_url: 'https://example.com/wp-admin/admin.php?page=image-optimization-settings',
	frontend_url: null,
	site_identity: {
		site_name_set: true,
		site_description_set: true,
		site_logo_set: true,
		site_favicon_set: true,
	},
};

const passAudit = ( id: string, weight = 10 ): Audit => ( {
	id,
	title: id,
	description: '',
	fixHint: '',
	categories: [ 'seo' ],
	severity: 'warning',
	weight,
	evaluate: async (): Promise< AuditResult > => ( { status: 'pass' } ),
} );

describe( 'runPageAudit', () => {
	beforeEach( () => {
		clearAuditRegistry();
		fetchMock.mockResolvedValue( FAKE_PAGE_CONTEXT );
		getHostDocumentElementsMock.mockReturnValue( [] );
		getHostDocumentIdMock.mockReturnValue( 1 );
	} );

	it( 'runs every registered evaluator and computes a report', async () => {
		// Arrange.
		registerAudit( passAudit( 'a' ) );

		// Act.
		const report = await runPageAudit( 1 );

		// Assert.
		expect( report.auditResults ).toHaveLength( 1 );
		expect( report.auditResults[ 0 ].result ).toEqual( { status: 'pass' } );
		expect( report.overall ).toBe( 100 );
	} );

	it( 'skips audits whose evaluator throws and reports a skipped reason', async () => {
		// Arrange.
		registerAudit( {
			...passAudit( 'b' ),
			evaluate: (): AuditResult => {
				throw new Error( 'boom' );
			},
		} );

		// Act.
		const report = await runPageAudit( 1 );

		// Assert.
		expect( report.auditResults[ 0 ].result ).toMatchObject( { status: 'skipped' } );
	} );

	it( 'rejects when documentId does not match the host document', async () => {
		// Arrange.
		getHostDocumentIdMock.mockReturnValue( 2 );
		registerAudit( passAudit( 'a' ) );

		// Act & Assert.
		await expect( runPageAudit( 1 ) ).rejects.toThrow( 'runPageAudit: documentId must match the host document.' );
	} );

	it( 'isolates failing audits from successful ones', async () => {
		registerAudit( passAudit( 'good', 5 ) );
		registerAudit( {
			...passAudit( 'bad', 5 ),
			evaluate: (): AuditResult => {
				throw new Error( 'boom' );
			},
		} );

		const report = await runPageAudit( 1 );

		const byId = Object.fromEntries( report.auditResults.map( ( r ) => [ r.audit.id, r.result.status ] ) );
		expect( byId.good ).toBe( 'pass' );
		expect( byId.bad ).toBe( 'skipped' );
	} );
} );

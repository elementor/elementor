import { getElements } from '@elementor/editor-elements';

import { fetchPageContext } from '../api/page-context-client';
import { clearAuditRegistry, registerAudit } from '../registry';
import { runPageAudit } from '../runner';
import { type Audit, type AuditResult, type PageContextResponse } from '../types';

jest.mock( '../api/page-context-client' );

jest.mock( '@elementor/editor-elements', () => ( {
	getElements: jest.fn(),
} ) );

const fetchMock = jest.mocked( fetchPageContext );
const getElementsMock = jest.mocked( getElements );

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
	cookiez_plugin_active: false,
	cookiez_plugin_url: 'https://example.com/wp-admin/plugin-install.php',
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
		getElementsMock.mockReturnValue( [] );
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

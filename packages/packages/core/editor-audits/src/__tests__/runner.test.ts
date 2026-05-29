import { getElements } from '@elementor/editor-elements';

import { fetchPageContext } from '../api/page-context-client';
import { clearRegistry, registerAudit } from '../registry';
import { runPageAudit } from '../runner';
import { type AuditResult, type PageContextResponse } from '../types';

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
};

describe( 'runPageAudit', () => {
	beforeEach( () => {
		clearRegistry();
		fetchMock.mockResolvedValue( FAKE_PAGE_CONTEXT );
		getElementsMock.mockReturnValue( [] );
	} );

	it( 'runs every registered evaluator and computes a report', async () => {
		// Arrange.
		registerAudit(
			{
				id: 'a',
				title: 'a',
				description: '',
				fixHint: '',
				categories: [ 'seo' ],
				severity: 'warning',
				weight: 10,
			},
			async (): Promise< AuditResult > => ( { status: 'pass' } )
		);

		// Act.
		const report = await runPageAudit( 1 );

		// Assert.
		expect( report.auditResults ).toHaveLength( 1 );
		expect( report.auditResults[ 0 ].result ).toEqual( { status: 'pass' } );
		expect( report.overall ).toBe( 100 );
	} );

	it( 'skips audits whose evaluator throws and reports a skipped reason', async () => {
		// Arrange.
		registerAudit(
			{
				id: 'b',
				title: 'b',
				description: '',
				fixHint: '',
				categories: [ 'seo' ],
				severity: 'warning',
				weight: 10,
			},
			(): AuditResult => {
				throw new Error( 'boom' );
			}
		);

		// Act.
		const report = await runPageAudit( 1 );

		// Assert.
		expect( report.auditResults[ 0 ].result ).toMatchObject( { status: 'skipped' } );
	} );

	it( 'isolates failing audits from successful ones', async () => {
		registerAudit(
			{
				id: 'good',
				title: '',
				description: '',
				fixHint: '',
				categories: [ 'seo' ],
				severity: 'warning',
				weight: 5,
			},
			async (): Promise< AuditResult > => ( { status: 'pass' } )
		);
		registerAudit(
			{
				id: 'bad',
				title: '',
				description: '',
				fixHint: '',
				categories: [ 'seo' ],
				severity: 'warning',
				weight: 5,
			},
			(): AuditResult => {
				throw new Error( 'boom' );
			}
		);

		const report = await runPageAudit( 1 );

		const byId = Object.fromEntries( report.auditResults.map( ( r ) => [ r.descriptor.id, r.result.status ] ) );
		expect( byId.good ).toBe( 'pass' );
		expect( byId.bad ).toBe( 'skipped' );
	} );
} );

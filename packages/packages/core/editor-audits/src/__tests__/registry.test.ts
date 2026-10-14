import { clearAuditRegistry, getRegisteredAudits, hasAudit, registerAudit } from '../registry';
import { type Audit } from '../types';

const testAudit: Audit = {
	id: 'audits/test',
	title: 'Test',
	description: 'A test audit',
	fixHint: 'Fix it',
	categories: [ 'seo' ],
	severity: 'warning',
	weight: 5,
	evaluate: async () => ( { status: 'pass' } ),
};

describe( 'audits registry', () => {
	beforeEach( () => clearAuditRegistry() );

	it( 'registers an audit and exposes it', () => {
		// Act.
		registerAudit( testAudit );

		// Assert.
		expect( getRegisteredAudits().map( ( audit ) => audit.id ) ).toContain( 'audits/test' );
		expect( hasAudit( 'audits/test' ) ).toBe( true );
	} );

	it( 'reports missing audit', () => {
		expect( hasAudit( 'audits/missing' ) ).toBe( false );
	} );

	it( 'overwrites a previously registered audit with the same id', () => {
		// Arrange.
		const first = jest.fn< Promise< { status: 'pass' } >, [] >().mockResolvedValue( { status: 'pass' } );
		const second = jest.fn< Promise< { status: 'pass' } >, [] >().mockResolvedValue( { status: 'pass' } );

		registerAudit( { ...testAudit, evaluate: first } );
		registerAudit( { ...testAudit, evaluate: second } );

		const audits = getRegisteredAudits();
		expect( audits ).toHaveLength( 1 );
		expect( audits[ 0 ].evaluate ).toBe( second );
	} );
} );

import { clearRegistry, getRegistered, hasEvaluator, registerAudit } from '../registry';
import { type AuditDescriptor } from '../types';

const descriptor: AuditDescriptor = {
	id: 'audits/test',
	title: 'Test',
	description: 'A test audit',
	fixHint: 'Fix it',
	categories: [ 'seo' ],
	severity: 'warning',
	weight: 5,
};

describe( 'audits registry', () => {
	beforeEach( () => clearRegistry() );

	it( 'registers an audit and exposes it', () => {
		// Act.
		registerAudit( descriptor, async () => ( { status: 'pass' } ) );

		// Assert.
		expect( getRegistered().map( ( r ) => r.descriptor.id ) ).toContain( 'audits/test' );
		expect( hasEvaluator( 'audits/test' ) ).toBe( true );
	} );

	it( 'reports missing evaluator', () => {
		expect( hasEvaluator( 'audits/missing' ) ).toBe( false );
	} );

	it( 'overwrites a previously registered audit with the same id', () => {
		// Arrange.
		const first = jest.fn< Promise< { status: 'pass' } >, [] >().mockResolvedValue( { status: 'pass' } );
		const second = jest.fn< Promise< { status: 'pass' } >, [] >().mockResolvedValue( { status: 'pass' } );

		registerAudit( descriptor, first );
		registerAudit( descriptor, second );

		const registered = getRegistered();
		expect( registered ).toHaveLength( 1 );
		expect( registered[ 0 ].evaluator ).toBe( second );
	} );
} );

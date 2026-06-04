import { type AuditDescriptor, type AuditSeverity } from '../../types';
import { sortFailedAuditResults } from '../sort-failed-audits';

function stubResult( severity: AuditSeverity, title: string ) {
	const descriptor = { id: title, severity, title } as AuditDescriptor;

	return { descriptor, result: { status: 'fail' as const, violations: [] } };
}

describe( 'sortFailedAuditResults', () => {
	it( 'orders failed audits by severity: error, warning, info', () => {
		// Arrange.
		const input = [
			stubResult( 'info', 'Info audit' ),
			stubResult( 'error', 'Error audit' ),
			stubResult( 'warning', 'Warning audit' ),
		];

		// Act.
		const sorted = sortFailedAuditResults( input );

		// Assert.
		expect( sorted.map( ( r ) => r.descriptor.severity ) ).toEqual( [ 'error', 'warning', 'info' ] );
	} );

	it( 'sorts same severity by title', () => {
		// Arrange.
		const input = [ stubResult( 'warning', 'Zebra' ), stubResult( 'warning', 'Alpha' ) ];

		// Act.
		const sorted = sortFailedAuditResults( input );

		// Assert.
		expect( sorted.map( ( r ) => r.descriptor.title ) ).toEqual( [ 'Alpha', 'Zebra' ] );
	} );

	it( 'does not mutate the input array', () => {
		// Arrange.
		const input = [ stubResult( 'info', 'B' ), stubResult( 'error', 'A' ) ];
		const originalOrder = input.map( ( r ) => r.descriptor.id );

		// Act.
		sortFailedAuditResults( input );

		// Assert.
		expect( input.map( ( r ) => r.descriptor.id ) ).toEqual( originalOrder );
	} );
} );

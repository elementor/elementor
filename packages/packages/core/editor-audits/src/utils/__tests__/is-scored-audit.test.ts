import { type AuditMeta } from '../../types';
import { isScoredAudit } from '../is-scored-audit';

function auditMeta( weight: number ): AuditMeta {
	return {
		id: 'a',
		title: 'a',
		description: '',
		fixHint: '',
		categories: [ 'compliance' ],
		severity: 'info',
		weight,
	};
}

describe( 'isScoredAudit', () => {
	it( 'is false for a zero-weight audit', () => {
		expect( isScoredAudit( auditMeta( 0 ) ) ).toBe( false );
	} );

	it( 'is true for a weighted audit', () => {
		expect( isScoredAudit( auditMeta( 1 ) ) ).toBe( true );
	} );
} );

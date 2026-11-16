import { AUDIT_ID_PREFIX } from '../constants';
import { type AuditSeverity } from '../types';

export type TrackingSeverity = 'error' | 'warning' | 'suggestion';

export function toTrackingSeverity( severity: AuditSeverity ): TrackingSeverity {
	return severity === 'info' ? 'suggestion' : severity;
}

export function toCheckName( auditId: string ): string {
	return auditId.replace( AUDIT_ID_PREFIX, '' ).replace( /-/g, '_' );
}

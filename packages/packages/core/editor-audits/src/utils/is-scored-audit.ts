import { type AuditMeta } from '../types';

export function isScoredAudit( audit: AuditMeta ): boolean {
	return audit.weight > 0;
}

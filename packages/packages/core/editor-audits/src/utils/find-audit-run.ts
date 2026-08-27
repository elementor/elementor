import { type AuditRun, type PageAuditReport } from '../types';

export function findAuditRun( report: PageAuditReport, auditId: string ): AuditRun | undefined {
	return report.auditResults.find( ( run ) => run.audit.id === auditId );
}

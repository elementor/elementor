import { __, sprintf } from '@wordpress/i18n';

import { type AuditCategory, type AuditSeverity, type PageAuditReport } from '../types';

export type SeverityCounts = Record< AuditSeverity, number >;

export const ALL_SEVERITIES = [ 'error', 'warning', 'info' ] as const;

export function countSeverities( report: PageAuditReport, category?: AuditCategory ): SeverityCounts {
	const counts: SeverityCounts = { error: 0, warning: 0, info: 0 };

	for ( const { audit, result } of report.auditResults ) {
		if ( result.status !== 'fail' ) {
			continue;
		}

		if ( category && ! audit.categories.includes( category ) ) {
			continue;
		}

		counts[ audit.severity ] += result.violations.length;
	}

	return counts;
}

export function severityPluralLabel( severity: AuditSeverity ): string {
	switch ( severity ) {
		case 'error':
			return __( 'Errors', 'elementor' );
		case 'warning':
			return __( 'Warnings', 'elementor' );
		case 'info':
			return __( 'Info', 'elementor' );
	}
}

export function severityRemainingCountLabel( severity: AuditSeverity, count: number ): string {
	switch ( severity ) {
		case 'error':
			return sprintf(
				/* translators: %d: number of remaining error violations. */
				__( '%d errors', 'elementor' ),
				count
			);
		case 'warning':
			return sprintf(
				/* translators: %d: number of remaining warning violations. */
				__( '%d warnings', 'elementor' ),
				count
			);
		case 'info':
			return sprintf(
				/* translators: %d: number of remaining info violations. */
				__( '%d info', 'elementor' ),
				count
			);
	}
}

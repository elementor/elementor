import { __ } from '@wordpress/i18n';

import { type AuditCategory } from './types';

export const AUDIT_PANEL_ID = 'audit-panel';

export const REPORT_STORAGE_KEY_PREFIX = 'elementor/audits/report';

export const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

export const ANGIE_FIX_ENTRY_POINT = 'audit_violation';

export const FEEDBACK_EXPERIMENT_NAME = 'in_editor_feedback';
export const FEEDBACK_ENTRY_POINT = 'audit_panel';

export const FEEDBACK_CLICKED_EVENT = 'audit_feedback_clicked';
export const FEEDBACK_SENT_EVENT = 'audit_feedback_sent';
export const FEEDBACK_CANCELLED_EVENT = 'audit_feedback_cancelled';
export const FEEDBACK_CLOSED_EVENT = 'audit_feedback_closed';

export const PANEL_VIEWED_EVENT = 'page_audit_panel_viewed';
export const PANEL_CLOSED_EVENT = 'page_audit_panel_closed';
export const RUN_STARTED_EVENT = 'page_audit_run_started';
export const RUN_COMPLETED_EVENT = 'page_audit_run_completed';
export const FINDING_CLICKED_EVENT = 'page_audit_finding_clicked';

export const TRACKING_WINDOW_NAME = 'page_audit';
export const TRACKING_TARGET_LOCATION = 'panel';
export const TRACKING_LOCATION_L1 = 'audit_panel';

export const FIRST_OPEN_MESSAGE_KEY = 'page-audit-panel-opened';
export const AUDIT_ID_PREFIX = 'audits/';

export const ALL_CATEGORIES: AuditCategory[] = [
	'best-practices',
	'seo',
	'accessibility',
	'performance',
	'compliance',
];

export const CATEGORY_LABELS: Record< AuditCategory, string > = {
	'best-practices': __( 'Best Practices', 'elementor' ),
	seo: __( 'SEO', 'elementor' ),
	accessibility: __( 'Accessibility', 'elementor' ),
	performance: __( 'Performance', 'elementor' ),
	compliance: __( 'Site compliance', 'elementor' ),
};

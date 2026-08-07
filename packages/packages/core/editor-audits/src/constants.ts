import { __ } from '@wordpress/i18n';

import { type AuditCategory } from './types';

export const AUDIT_PANEL_ID = 'audit-panel';

export const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

export const ANGIE_FIX_ENTRY_POINT = 'audit_violation';

export const FEEDBACK_EXPERIMENT_NAME = 'in_editor_feedback';
export const FEEDBACK_ENTRY_POINT = 'audit_panel';

export const FEEDBACK_CLICKED_EVENT = 'audit_feedback_clicked';
export const FEEDBACK_SENT_EVENT = 'audit_feedback_sent';
export const FEEDBACK_CANCELLED_EVENT = 'audit_feedback_cancelled';
export const FEEDBACK_CLOSED_EVENT = 'audit_feedback_closed';

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
	compliance: __( 'Compliance', 'elementor' ),
};

import { __ } from '@wordpress/i18n';

import { type AuditCategory } from './types';

export const AUDIT_PANEL_ID = 'audit-panel';

export const CREATE_WIDGET_EVENT = 'elementor/editor/create-widget';

export const ANGIE_FIX_ENTRY_POINT = 'audit_violation';

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

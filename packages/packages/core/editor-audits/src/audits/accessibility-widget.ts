import { __ } from '@wordpress/i18n';

import { type Audit } from '../types';
import { hasAccessibilityWidgetScript } from '../utils/scan-accessibility-widgets';

export const audit: Audit = {
	id: 'audits/accessibility-widget',
	title: __( 'Add an accessibility widget', 'elementor' ),
	description: __( 'Make your site more inclusive by adding an accessibility widget.', 'elementor' ),
	fixHint: __( 'Activate Ally’s accessibility widget to give visitors on-page accessibility tools.', 'elementor' ),
	categories: [ 'accessibility' ],
	severity: 'info',
	weight: 1,
	evaluate: ( ctx ) => {
		if ( ! ctx.pageContext.frontend_url ) {
			return { status: 'skipped', reason: __( 'Page is not published.', 'elementor' ) };
		}

		if ( ctx.renderedHtml && hasAccessibilityWidgetScript( ctx.renderedHtml ) ) {
			return { status: 'pass' };
		}

		const isReady = ctx.pageContext.ally_plugin_active;

		return {
			status: 'fail',
			violations: [
				{
					auditId: audit.id,
					label: __( 'No accessibility widget is active on this site.', 'elementor' ),
					externalUrl: isReady ? ctx.pageContext.ally_widget_settings_url : ctx.pageContext.ally_plugin_url,
					ctaLabel: __( 'Activate', 'elementor' ),
				},
			],
		};
	},
};

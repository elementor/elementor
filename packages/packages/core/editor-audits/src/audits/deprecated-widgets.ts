import { getWidgetsCache } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { type Audit, type AuditViolation } from '../types';
import { walkElements } from '../utils/walk';

const DEPRECATION_CONTROL_NAME = 'deprecation_message';

export const audit: Audit = {
	id: 'audits/deprecated-widgets',
	title: __( 'Deprecated widgets', 'elementor' ),
	description: __(
		'Deprecated widgets should not be used. For better capabilities use the recommended replacement.',
		'elementor'
	),
	fixHint: __( 'Replace each deprecated widget with the recommended new widget shown in its panel.', 'elementor' ),
	categories: [ 'best-practices', 'performance' ],
	severity: 'warning',
	weight: 7,
	evaluate: ( ctx ) => {
		const widgetsCache = getWidgetsCache();

		if ( ! widgetsCache ) {
			return { status: 'skipped', reason: 'widgets-cache-unavailable' };
		}

		const violations: AuditViolation[] = [];

		walkElements( ctx.elements.tree, ( node ) => {
			if ( node.elType !== 'widget' ) {
				return;
			}

			const config = widgetsCache[ node.widgetType ?? '' ];

			if ( ! config?.controls ) {
				return;
			}

			const controls = config.controls as Record< string, unknown >;
			const deprecationControl = controls[ DEPRECATION_CONTROL_NAME ];

			if ( ! deprecationControl || typeof deprecationControl !== 'object' ) {
				return;
			}

			violations.push( {
				auditId: audit.id,
				elementId: node.id,
				targetHint: 'element-settings',
				label: __( 'Using deprecated widget.', 'elementor' ),
			} );
		} );

		return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
	},
};

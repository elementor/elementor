import { getWidgetsCache } from '@elementor/editor-elements';
import { __ } from '@wordpress/i18n';

import { walkElements } from '../lib/walk';
import { type AuditDescriptor, type AuditEvaluator, type AuditViolation } from '../types';

const DEPRECATION_CONTROL_NAME = 'deprecation_message';

export const descriptor: AuditDescriptor = {
	id: 'audits/deprecated-widgets',
	title: __( 'Deprecated widgets', 'elementor' ),
	description: __(
		'Deprecated widgets should not be used. For better capabilities use the recommended replacement.',
		'elementor'
	),
	fixHint: __( 'Replace each deprecated widget with the recommended new widget shown in its panel.', 'elementor' ),
	categories: [ 'health', 'performance' ],
	severity: 'warning',
	weight: 7,
};

type DeprecationControl = {
	content?: string;
};

function getDeprecationControl( controls: object ): DeprecationControl | null {
	const control = ( controls as Record< string, unknown > )[ DEPRECATION_CONTROL_NAME ];

	if ( ! control || typeof control !== 'object' ) {
		return null;
	}

	return control as DeprecationControl;
}

export const evaluator: AuditEvaluator = ( ctx ) => {
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

		const deprecationControl = getDeprecationControl( config.controls );

		if ( ! deprecationControl ) {
			return;
		}

		const widgetTitle = config.title ?? node.widgetType ?? '';

		violations.push( {
			auditId: descriptor.id,
			elementId: node.id,
			targetHint: 'element-settings',
			label: widgetTitle + ' ' + __( 'is deprecated', 'elementor' ),
			detail: deprecationControl.content ?? '',
		} );
	} );

	return violations.length === 0 ? { status: 'pass' } : { status: 'fail', violations };
};
